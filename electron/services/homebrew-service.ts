import { randomUUID } from 'node:crypto';

import type {
  BrewAvailability,
  BrewJobCompleteEvent,
  BrewJobFailedEvent,
  BrewJobProgressEvent,
  CatalogPackage,
  CheckNowResult,
  InstallOneRequest,
  InstalledPackage,
  OutdatedPackage,
  PackageDependencyGroup,
  PackageDetails,
  PackageDetailsRequest,
  PinOneRequest,
  ReinstallOneRequest,
  SearchCatalogRequest,
  SearchCatalogResponse,
  SyncMetadataResult,
  UnpinOneRequest,
  UninstallOneRequest,
  UpgradeOneRequest
} from '../../src/shared/contracts';
import { searchCatalogRequestSchema } from '../../src/shared/contracts';
import { log } from '../utils/logger';
import { CatalogCache } from './catalog-cache';
import { CommandQueue } from './command-queue';
import {
  normalizeCatalog,
  normalizeInstalled,
  normalizeOutdated,
  type BrewInfoResponse,
  type BrewOutdatedResponse
} from './homebrew-normalizer';
import { BrewRunner } from './brew-runner';

const CATALOG_TTL_MS = 24 * 60 * 60 * 1000;
const DETAILS_TTL_MS = 10 * 60 * 1000;

interface CatalogMaterialized {
  packages: CatalogPackage[];
  source: 'network' | 'cache';
  stale: boolean;
  fetchedAt: string | null;
}

interface PackageDetailsCacheEntry {
  details: PackageDetails;
  cachedAt: number;
}

export interface JobEventSink {
  onProgress: (event: BrewJobProgressEvent) => void;
  onComplete: (event: BrewJobCompleteEvent) => void;
  onFailed: (event: BrewJobFailedEvent) => void;
}

export function buildInstallCommand(request: InstallOneRequest): string[] {
  return request.kind === 'formula'
    ? ['install', '--formula', request.name]
    : ['install', '--cask', request.name];
}

export function buildReinstallCommand(request: ReinstallOneRequest): string[] {
  if (request.kind === 'formula') {
    return ['reinstall', '--formula', request.name];
  }

  return request.zap
    ? ['reinstall', '--cask', '--zap', request.name]
    : ['reinstall', '--cask', request.name];
}

export function buildUninstallCommand(request: UninstallOneRequest): string[] {
  if (request.kind === 'formula') {
    return ['uninstall', '--formula', request.name];
  }

  return request.zap
    ? ['uninstall', '--cask', '--zap', request.name]
    : ['uninstall', '--cask', request.name];
}

export function buildPinCommand(request: PinOneRequest): string[] {
  return ['pin', request.name];
}

export function buildUnpinCommand(request: UnpinOneRequest): string[] {
  return ['unpin', request.name];
}

export class HomebrewService {
  private readonly runner = new BrewRunner();
  private readonly mutationQueue = new CommandQueue();
  private readonly catalogCache = new CatalogCache();
  private readonly detailsCache = new Map<string, PackageDetailsCacheEntry>();

  async getBrewAvailability(): Promise<BrewAvailability> {
    return this.runner.getAvailability();
  }

  async getInstalled(): Promise<InstalledPackage[]> {
    const [formulaRaw, caskRaw] = await Promise.all([
      this.runner.runJson<BrewInfoResponse>(['info', '--json=v2', '--installed', '--formula']),
      this.runner.runJson<BrewInfoResponse>(['info', '--json=v2', '--installed', '--cask'])
    ]);

    return normalizeInstalled({
      formulae: formulaRaw.formulae,
      casks: caskRaw.casks
    });
  }

  async getOutdated(): Promise<OutdatedPackage[]> {
    const [formulaRaw, caskRaw] = await Promise.all([
      this.runner.runJson<BrewOutdatedResponse>(['outdated', '--formula', '--json=v2']),
      this.runner.runJson<BrewOutdatedResponse>(['outdated', '--cask', '--json=v2'])
    ]);

    return normalizeOutdated({
      formulae: formulaRaw.formulae,
      casks: caskRaw.casks
    });
  }

  async checkNow(): Promise<CheckNowResult> {
    const outdated = await this.getOutdated();

    return {
      count: outdated.length,
      checkedAt: new Date().toISOString()
    };
  }

  async syncMetadata(): Promise<SyncMetadataResult> {
    log.info('Running explicit brew metadata sync');

    const result = await this.runner.runText(['update'], {
      allowAutoUpdate: true,
      timeoutMs: 10 * 60 * 1000
    });

    return {
      success: true,
      output: `${result.stdout}${result.stderr}`.trim(),
      syncedAt: new Date().toISOString()
    };
  }

  async searchCatalog(request: SearchCatalogRequest): Promise<SearchCatalogResponse> {
    const parsedRequest = searchCatalogRequestSchema.parse(request);
    const catalog = await this.resolveCatalog(parsedRequest.refresh);

    const query = parsedRequest.query.toLocaleLowerCase();
    const kindSet = new Set(parsedRequest.kinds);

    const filtered = catalog.packages.filter((item) => {
      if (!kindSet.has(item.kind)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [item.name, item.fullName, item.desc ?? '', item.tap].some((field) =>
        field.toLocaleLowerCase().includes(query)
      );
    });

    const start = (parsedRequest.page - 1) * parsedRequest.pageSize;
    const pagedItems = filtered.slice(start, start + parsedRequest.pageSize);

    return {
      items: pagedItems,
      total: filtered.length,
      page: parsedRequest.page,
      pageSize: parsedRequest.pageSize,
      stale: catalog.stale,
      source: catalog.source,
      lastUpdatedAt: catalog.fetchedAt
    };
  }

  async getPackageDetails(request: PackageDetailsRequest): Promise<PackageDetails> {
    const cacheKey = `${request.kind}:${request.name}`;
    const cached = this.detailsCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < DETAILS_TTL_MS) {
      return {
        ...cached.details,
        source: 'cache',
        warnings: [...cached.details.warnings]
      };
    }

    let localDetails: PackageDetails | null = null;
    let remoteDetails: PackageDetails | null = null;
    const warnings: string[] = [];

    try {
      localDetails = await this.resolveLocalDetails(request);
    } catch (error) {
      warnings.push(`Local brew info unavailable: ${(error as Error).message}`);
    }

    try {
      remoteDetails = await this.resolveRemoteDetails(request);
    } catch (error) {
      warnings.push(`Remote Homebrew API unavailable: ${(error as Error).message}`);
    }

    if (!localDetails && !remoteDetails) {
      if (cached) {
        return {
          ...cached.details,
          source: 'cache',
          warnings: uniqueStrings([
            ...cached.details.warnings,
            'Using cached package details because live lookup failed.',
            ...warnings
          ])
        };
      }

      throw new Error(`Unable to load package details for ${request.kind}:${request.name}.`);
    }

    const resolved = this.mergeDetails(localDetails, remoteDetails, warnings);
    this.detailsCache.set(cacheKey, { details: resolved, cachedAt: now });
    return resolved;
  }

  async upgradeOne(request: UpgradeOneRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued upgrade for ${request.name}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue((signal) =>
      this.runUpgradeJob(
        jobId,
        request.kind === 'formula'
          ? ['upgrade', '--formula', request.name]
          : ['upgrade', '--cask', request.name],
        sink,
        request.kind,
        request.name,
        signal
      )
    );
  }

  async installOne(request: InstallOneRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();
    const command = buildInstallCommand(request);
    const installTimeoutMs = 20 * 60 * 1000;

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued install for ${request.name}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      sink.onProgress({
        jobId,
        stage: 'running',
        message: `Installing ${request.name}`,
        packageName: request.name,
        kind: request.kind,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await this.runner.runText(command, {
          signal,
          timeoutMs: installTimeoutMs,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${result.stdout}${result.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } catch (error) {
        const failed: BrewJobFailedEvent = {
          jobId,
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        };

        sink.onFailed(failed);
        throw error;
      } finally {
        this.invalidateDetailsCacheEntry(request.kind, request.name);
      }
    }, installTimeoutMs);
  }

  async reinstallOne(request: ReinstallOneRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();
    const command = buildReinstallCommand(request);
    const reinstallTimeoutMs = 20 * 60 * 1000;
    const reinstallTarget =
      request.kind === 'cask' && request.zap ? `${request.name} (--zap)` : request.name;

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued reinstall for ${reinstallTarget}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      sink.onProgress({
        jobId,
        stage: 'running',
        message: `Reinstalling ${reinstallTarget}`,
        packageName: request.name,
        kind: request.kind,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await this.runner.runText(command, {
          signal,
          timeoutMs: reinstallTimeoutMs,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${result.stdout}${result.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } catch (error) {
        const failed: BrewJobFailedEvent = {
          jobId,
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        };

        sink.onFailed(failed);
        throw error;
      } finally {
        this.invalidateDetailsCacheEntry(request.kind, request.name);
      }
    }, reinstallTimeoutMs);
  }

  async uninstallOne(
    request: UninstallOneRequest,
    sink: JobEventSink
  ): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();
    const command = buildUninstallCommand(request);
    const uninstallTimeoutMs = 20 * 60 * 1000;
    const uninstallTarget = request.kind === 'cask' && request.zap ? `${request.name} (--zap)` : request.name;

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued uninstall for ${uninstallTarget}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      sink.onProgress({
        jobId,
        stage: 'running',
        message: `Uninstalling ${uninstallTarget}`,
        packageName: request.name,
        kind: request.kind,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await this.runner.runText(command, {
          signal,
          timeoutMs: uninstallTimeoutMs,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${result.stdout}${result.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } catch (error) {
        const failed: BrewJobFailedEvent = {
          jobId,
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        };

        sink.onFailed(failed);
        throw error;
      } finally {
        this.invalidateDetailsCacheEntry(request.kind, request.name);
      }
    }, uninstallTimeoutMs);
  }

  async pinOne(request: PinOneRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();
    const command = buildPinCommand(request);
    const pinTimeoutMs = 5 * 60 * 1000;

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued pin for ${request.name}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      sink.onProgress({
        jobId,
        stage: 'running',
        message: `Pinning ${request.name}`,
        packageName: request.name,
        kind: request.kind,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await this.runner.runText(command, {
          signal,
          timeoutMs: pinTimeoutMs,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${result.stdout}${result.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } catch (error) {
        const failed: BrewJobFailedEvent = {
          jobId,
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        };

        sink.onFailed(failed);
        throw error;
      } finally {
        this.invalidateDetailsCacheEntry(request.kind, request.name);
      }
    }, pinTimeoutMs);
  }

  async unpinOne(request: UnpinOneRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();
    const command = buildUnpinCommand(request);
    const unpinTimeoutMs = 5 * 60 * 1000;

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: `Queued unpin for ${request.name}`,
      packageName: request.name,
      kind: request.kind,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      sink.onProgress({
        jobId,
        stage: 'running',
        message: `Unpinning ${request.name}`,
        packageName: request.name,
        kind: request.kind,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await this.runner.runText(command, {
          signal,
          timeoutMs: unpinTimeoutMs,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: request.name,
              kind: request.kind,
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${result.stdout}${result.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } catch (error) {
        const failed: BrewJobFailedEvent = {
          jobId,
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        };

        sink.onFailed(failed);
        throw error;
      } finally {
        this.invalidateDetailsCacheEntry(request.kind, request.name);
      }
    }, unpinTimeoutMs);
  }

  async upgradeAll(sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const jobId = randomUUID();

    sink.onProgress({
      jobId,
      stage: 'queued',
      message: 'Queued upgrade for all outdated packages',
      packageName: null,
      kind: null,
      timestamp: new Date().toISOString()
    });

    return this.mutationQueue.enqueue(async (signal) => {
      try {
        sink.onProgress({
          jobId,
          stage: 'running',
          message: 'Running formula upgrades',
          packageName: null,
          kind: null,
          timestamp: new Date().toISOString()
        });

        const formulaOutput = await this.runner.runText(['upgrade', '--formula'], {
          signal,
          timeoutMs: 30 * 60 * 1000,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: null,
              kind: 'formula',
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: null,
              kind: 'formula',
              timestamp: new Date().toISOString()
            })
        });

        sink.onProgress({
          jobId,
          stage: 'running',
          message: 'Running cask upgrades',
          packageName: null,
          kind: null,
          timestamp: new Date().toISOString()
        });

        const caskOutput = await this.runner.runText(['upgrade', '--cask'], {
          signal,
          timeoutMs: 30 * 60 * 1000,
          onStdout: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: null,
              kind: 'cask',
              timestamp: new Date().toISOString()
            }),
          onStderr: (chunk) =>
            sink.onProgress({
              jobId,
              stage: 'output',
              message: chunk,
              packageName: null,
              kind: 'cask',
              timestamp: new Date().toISOString()
            })
        });

        const event: BrewJobCompleteEvent = {
          jobId,
          success: true,
          output: `${formulaOutput.stdout}\n${formulaOutput.stderr}\n${caskOutput.stdout}\n${caskOutput.stderr}`.trim(),
          timestamp: new Date().toISOString()
        };

        sink.onComplete(event);
        return event;
      } finally {
        this.invalidateAllDetailsCache();
      }
    });
  }

  private async runUpgradeJob(
    jobId: string,
    command: string[],
    sink: JobEventSink,
    kind: 'formula' | 'cask',
    packageName: string,
    signal: AbortSignal
  ): Promise<BrewJobCompleteEvent> {
    sink.onProgress({
      jobId,
      stage: 'running',
      message: `Upgrading ${packageName}`,
      packageName,
      kind,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.runner.runText(command, {
        signal,
        timeoutMs: 20 * 60 * 1000,
        onStdout: (chunk) =>
          sink.onProgress({
            jobId,
            stage: 'output',
            message: chunk,
            packageName,
            kind,
            timestamp: new Date().toISOString()
          }),
        onStderr: (chunk) =>
          sink.onProgress({
            jobId,
            stage: 'output',
            message: chunk,
            packageName,
            kind,
            timestamp: new Date().toISOString()
          })
      });

      const event: BrewJobCompleteEvent = {
        jobId,
        success: true,
        output: `${result.stdout}${result.stderr}`.trim(),
        timestamp: new Date().toISOString()
      };

      sink.onComplete(event);
      return event;
    } catch (error) {
      const failed: BrewJobFailedEvent = {
        jobId,
        error: (error as Error).message,
        output: '',
        timestamp: new Date().toISOString()
      };

      sink.onFailed(failed);
      throw error;
    } finally {
      this.invalidateDetailsCacheEntry(kind, packageName);
    }
  }

  private invalidateDetailsCacheEntry(
    kind: PackageDetailsRequest['kind'],
    packageName: string
  ): void {
    this.detailsCache.delete(`${kind}:${packageName}`);
  }

  private invalidateAllDetailsCache(): void {
    this.detailsCache.clear();
  }

  private async resolveLocalDetails(request: PackageDetailsRequest): Promise<PackageDetails> {
    const raw = request.kind === 'formula'
      ? await this.runner.runJson<BrewInfoResponse>(['info', '--json=v2', '--formula', request.name])
      : await this.runner.runJson<BrewInfoResponse>(['info', '--json=v2', '--cask', request.name]);

    if (request.kind === 'formula') {
      const item = Array.isArray(raw.formulae) ? raw.formulae[0] : null;
      if (!isObject(item)) {
        throw new Error('No local formula details returned from brew info.');
      }

      return normalizeFormulaDetails(item, request.name, 'local', []);
    }

    const item = Array.isArray(raw.casks) ? raw.casks[0] : null;
    if (!isObject(item)) {
      throw new Error('No local cask details returned from brew info.');
    }

    return normalizeCaskDetails(item, request.name, 'local', []);
  }

  private async resolveRemoteDetails(request: PackageDetailsRequest): Promise<PackageDetails> {
    const url = request.kind === 'formula'
      ? `https://formulae.brew.sh/api/formula/${encodeURIComponent(request.name)}.json`
      : `https://formulae.brew.sh/api/cask/${encodeURIComponent(request.name)}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Homebrew API request failed (${response.status}).`);
    }

    const raw = (await response.json()) as unknown;
    if (!isObject(raw)) {
      throw new Error('Homebrew API returned malformed package details.');
    }

    if (request.kind === 'formula') {
      return normalizeFormulaDetails(raw, request.name, 'remote', []);
    }

    return normalizeCaskDetails(raw, request.name, 'remote', []);
  }

  private mergeDetails(
    localDetails: PackageDetails | null,
    remoteDetails: PackageDetails | null,
    warnings: string[]
  ): PackageDetails {
    if (localDetails && remoteDetails) {
      return {
        id: localDetails.id,
        kind: localDetails.kind,
        name: localDetails.name,
        fullName: localDetails.fullName || remoteDetails.fullName,
        desc: preferString(localDetails.desc, remoteDetails.desc),
        homepage: preferString(localDetails.homepage, remoteDetails.homepage),
        tap: preferString(localDetails.tap, remoteDetails.tap),
        license: preferString(localDetails.license, remoteDetails.license),
        dependencies: mergeDependencyGroups(localDetails.dependencies, remoteDetails.dependencies),
        caveats: preferString(localDetails.caveats, remoteDetails.caveats),
        versionSnapshot: {
          installedVersions:
            localDetails.versionSnapshot.installedVersions.length > 0
              ? localDetails.versionSnapshot.installedVersions
              : remoteDetails.versionSnapshot.installedVersions,
          currentVersion: preferString(
            localDetails.versionSnapshot.currentVersion,
            remoteDetails.versionSnapshot.currentVersion
          ),
          stableVersion: preferString(
            localDetails.versionSnapshot.stableVersion,
            remoteDetails.versionSnapshot.stableVersion
          ),
          headVersion: preferString(
            localDetails.versionSnapshot.headVersion,
            remoteDetails.versionSnapshot.headVersion
          )
        },
        deprecated: localDetails.deprecated || remoteDetails.deprecated,
        disabled: localDetails.disabled || remoteDetails.disabled,
        pinned: localDetails.pinned,
        warnings: uniqueStrings([...localDetails.warnings, ...remoteDetails.warnings, ...warnings]),
        source: 'hybrid',
        fetchedAt: new Date().toISOString()
      };
    }

    if (localDetails) {
      return {
        ...localDetails,
        warnings: uniqueStrings([...localDetails.warnings, ...warnings]),
        source: 'local',
        fetchedAt: new Date().toISOString()
      };
    }

    if (!remoteDetails) {
      throw new Error('No package details to merge.');
    }

    return {
      ...remoteDetails,
      warnings: uniqueStrings([...remoteDetails.warnings, ...warnings]),
      source: 'remote',
      fetchedAt: new Date().toISOString()
    };
  }

  private async resolveCatalog(refresh: boolean): Promise<CatalogMaterialized> {
    const cached = await this.catalogCache.read();
    const cacheAgeMs = cached ? Date.now() - new Date(cached.fetchedAt).getTime() : Number.POSITIVE_INFINITY;
    const shouldUseCache = cached && !refresh && cacheAgeMs < CATALOG_TTL_MS;

    if (shouldUseCache) {
      return {
        packages: cached.packages,
        source: 'cache',
        stale: false,
        fetchedAt: cached.fetchedAt
      };
    }

    try {
      const [formulaResponse, caskResponse] = await Promise.all([
        fetch('https://formulae.brew.sh/api/formula.json'),
        fetch('https://formulae.brew.sh/api/cask.json')
      ]);

      if (!formulaResponse.ok || !caskResponse.ok) {
        throw new Error('Unable to fetch Homebrew catalog API data.');
      }

      const formulaJson = (await formulaResponse.json()) as unknown[];
      const caskJson = (await caskResponse.json()) as unknown[];
      const normalized = normalizeCatalog(formulaJson, caskJson);
      const fetchedAt = new Date().toISOString();

      await this.catalogCache.write({ fetchedAt, packages: normalized });

      return {
        packages: normalized,
        source: 'network',
        stale: false,
        fetchedAt
      };
    } catch (error) {
      log.warn('Catalog refresh failed, checking stale cache fallback', error);

      if (cached) {
        return {
          packages: cached.packages,
          source: 'cache',
          stale: true,
          fetchedAt: cached.fetchedAt
        };
      }

      throw error;
    }
  }
}

function normalizeFormulaDetails(
  raw: Record<string, unknown>,
  fallbackName: string,
  source: PackageDetails['source'],
  warnings: string[]
): PackageDetails {
  const name = coerceName(raw, ['name'], fallbackName);
  const fullName = coerceName(raw, ['full_name', 'name'], name);
  const versions = isObject(raw.versions) ? raw.versions : {};
  const stableVersion = readString(versions.stable);
  const installedVersions = normalizeFormulaInstalledVersions(raw);
  const currentVersion = stableVersion;
  const headVersion = readString(versions.head);

  return {
    id: `formula:${name}`,
    kind: 'formula',
    name,
    fullName,
    desc: readString(raw.desc),
    homepage: readString(raw.homepage),
    tap: readString(raw.tap) ?? 'homebrew/core',
    license: normalizeLicense(raw.license),
    dependencies: buildFormulaDependencyGroups(raw),
    caveats: normalizeCaveats(raw.caveats),
    versionSnapshot: {
      installedVersions,
      currentVersion,
      stableVersion,
      headVersion
    },
    deprecated: Boolean(raw.deprecated),
    disabled: Boolean(raw.disabled),
    pinned: Boolean(raw.pinned),
    warnings,
    source,
    fetchedAt: new Date().toISOString()
  };
}

function normalizeCaskDetails(
  raw: Record<string, unknown>,
  fallbackName: string,
  source: PackageDetails['source'],
  warnings: string[]
): PackageDetails {
  const name = coerceName(raw, ['token', 'full_token', 'name'], fallbackName);
  const fullName = coerceName(raw, ['full_token', 'token', 'name'], name);
  const stableVersion = readString(raw.version);
  const installedVersions = normalizeCaskInstalledVersions(raw);

  return {
    id: `cask:${name}`,
    kind: 'cask',
    name,
    fullName,
    desc: readString(raw.desc),
    homepage: readString(raw.homepage),
    tap: readString(raw.tap) ?? 'homebrew/cask',
    license: normalizeLicense(raw.license),
    dependencies: buildCaskDependencyGroups(raw),
    caveats: normalizeCaveats(raw.caveats),
    versionSnapshot: {
      installedVersions,
      currentVersion: stableVersion,
      stableVersion,
      headVersion: null
    },
    deprecated: Boolean(raw.deprecated),
    disabled: Boolean(raw.disabled),
    pinned: false,
    warnings,
    source,
    fetchedAt: new Date().toISOString()
  };
}

function buildFormulaDependencyGroups(raw: Record<string, unknown>): PackageDependencyGroup[] {
  const groups: PackageDependencyGroup[] = [];

  const runtime = normalizeStringList(raw.dependencies);
  if (runtime.length > 0) {
    groups.push({ key: 'runtime', label: 'Runtime dependencies', items: runtime });
  }

  const build = normalizeStringList(raw.build_dependencies);
  if (build.length > 0) {
    groups.push({ key: 'build', label: 'Build dependencies', items: build });
  }

  const recommended = normalizeStringList(raw.recommended_dependencies);
  if (recommended.length > 0) {
    groups.push({ key: 'recommended', label: 'Recommended dependencies', items: recommended });
  }

  const optional = normalizeStringList(raw.optional_dependencies);
  if (optional.length > 0) {
    groups.push({ key: 'optional', label: 'Optional dependencies', items: optional });
  }

  const requirements = normalizeRequirements(raw.requirements);
  if (requirements.length > 0) {
    groups.push({ key: 'requirements', label: 'Requirements', items: requirements });
  }

  return groups;
}

function buildCaskDependencyGroups(raw: Record<string, unknown>): PackageDependencyGroup[] {
  const dependsOn = flattenConstraints(raw.depends_on);
  if (dependsOn.length === 0) {
    return [];
  }

  return [
    {
      key: 'constraints',
      label: 'Cask constraints',
      items: dependsOn
    }
  ];
}

function flattenConstraints(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const text = stringifyScalar(item);
        if (!text) {
          return null;
        }

        return prefix ? `${prefix}: ${text}` : text;
      })
      .filter((item): item is string => item !== null);
  }

  if (isObject(value)) {
    const output: string[] = [];
    for (const [key, child] of Object.entries(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      output.push(...flattenConstraints(child, nextPrefix));
    }
    return output;
  }

  if (typeof value === 'boolean') {
    if (!value) {
      return [];
    }
    return prefix ? [prefix] : [];
  }

  const text = stringifyScalar(value);
  if (!text) {
    return [];
  }

  return prefix ? [`${prefix}: ${text}`] : [text];
}

function stringifyScalar(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return null;
}

function normalizeRequirements(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(
    value
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (isObject(item) && typeof item.name === 'string') {
          return item.name;
        }

        return null;
      })
      .filter((item): item is string => Boolean(item))
  );
}

function normalizeFormulaInstalledVersions(raw: Record<string, unknown>): string[] {
  const installed = Array.isArray(raw.installed) ? raw.installed : [];
  return uniqueStrings(
    installed
      .map((item) => {
        if (!isObject(item)) {
          return null;
        }
        return readString(item.version);
      })
      .filter((item): item is string => Boolean(item))
  );
}

function normalizeCaskInstalledVersions(raw: Record<string, unknown>): string[] {
  if (Array.isArray(raw.installed)) {
    return uniqueStrings(
      raw.installed
        .map((item) => (typeof item === 'string' ? item : null))
        .filter((item): item is string => Boolean(item))
    );
  }

  if (typeof raw.installed === 'string') {
    return [raw.installed];
  }

  return [];
}

function normalizeLicense(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    const licenses = value.filter((item): item is string => typeof item === 'string').map((item) => item.trim());
    return licenses.length > 0 ? licenses.join(', ') : null;
  }

  if (isObject(value)) {
    return JSON.stringify(value);
  }

  return null;
}

function normalizeCaveats(value: unknown): string | null {
  if (typeof value === 'string') {
    const caveat = value.trim();
    return caveat.length > 0 ? caveat : null;
  }

  if (Array.isArray(value)) {
    const parts = value.filter((item): item is string => typeof item === 'string').map((item) => item.trim());
    if (parts.length > 0) {
      return parts.join('\n');
    }
  }

  return null;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(
    value
      .map((item) => (typeof item === 'string' ? item.trim() : null))
      .filter((item): item is string => Boolean(item))
  );
}

function coerceName(raw: Record<string, unknown>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return fallback;
}

function preferString(primary: string | null, secondary: string | null): string | null {
  if (primary && primary.trim().length > 0) {
    return primary;
  }

  if (secondary && secondary.trim().length > 0) {
    return secondary;
  }

  return null;
}

function mergeDependencyGroups(
  localGroups: PackageDependencyGroup[],
  remoteGroups: PackageDependencyGroup[]
): PackageDependencyGroup[] {
  const grouped = new Map<PackageDependencyGroup['key'], PackageDependencyGroup>();

  for (const group of [...localGroups, ...remoteGroups]) {
    const existing = grouped.get(group.key);
    if (!existing) {
      grouped.set(group.key, {
        key: group.key,
        label: group.label,
        items: uniqueStrings(group.items)
      });
      continue;
    }

    grouped.set(group.key, {
      key: group.key,
      label: existing.label,
      items: uniqueStrings([...existing.items, ...group.items])
    });
  }

  return Array.from(grouped.values());
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
