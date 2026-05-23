import { Injectable, inject } from '@angular/core';

import type {
  ActionTemplateStep,
  BatchJobResult,
  BatchManyRequest,
  InstallOneRequest,
  PackageKind,
  PinOneRequest,
  ReinstallOneRequest,
  TemplatesRunRequest,
  UninstallImpactResponse,
  UninstallOneRequest,
  UnpinOneRequest,
  UpgradeOneRequest
} from '../../../shared/contracts';
import { BrewFacadeService } from './brew-facade.service';
import { ToastService } from './toast.service';
import { SettingsStore } from '../stores/settings.store';

export interface PackageTarget {
  kind: PackageKind;
  name: string;
}

const ALLOWED_STEP_TRANSITIONS: Record<ActionTemplateStep['action'], ActionTemplateStep['action'][]> = {
  install: ['pin', 'upgradeOne'],
  pin: [],
  unpin: ['pin'],
  upgradeOne: ['pin']
};

@Injectable({ providedIn: 'root' })
export class PackageActionsService {
  private readonly facade = inject(BrewFacadeService);
  private readonly toast = inject(ToastService);
  private readonly settingsStore = inject(SettingsStore);

  readonly showAdvancedInstallOptions = () =>
    this.settingsStore.settings().showAdvancedInstallOptions;

  validateTemplateSteps(steps: ActionTemplateStep[]): string | null {
    if (steps.length === 0) {
      return 'Template must include at least one step.';
    }

    for (let index = 0; index < steps.length - 1; index += 1) {
      const current = steps[index]!.action;
      const next = steps[index + 1]!.action;
      const allowed = ALLOWED_STEP_TRANSITIONS[current] ?? [];
      if (!allowed.includes(next)) {
        return `Step transition not allowed: ${current} → ${next}`;
      }
    }

    return null;
  }

  buildTemplateCommandPreview(templateName: string, steps: ActionTemplateStep[], target: PackageTarget): string[] {
    return steps.map((step) => {
      switch (step.action) {
        case 'install':
          return target.kind === 'formula'
            ? `brew install --formula ${target.name}`
            : `brew install --cask ${target.name}`;
        case 'pin':
          return `brew pin ${target.name}`;
        case 'unpin':
          return `brew unpin ${target.name}`;
        case 'upgradeOne':
          return target.kind === 'formula'
            ? `brew upgrade --formula ${target.name}`
            : `brew upgrade --cask ${target.name}`;
        default:
          return `${step.action} ${target.name}`;
      }
    }).map((line, index) => `${index + 1}. ${line}`);
  }

  async getUninstallImpact(target: PackageTarget): Promise<UninstallImpactResponse> {
    return this.facade.getUninstallImpact({ kind: target.kind, name: target.name });
  }

  buildUninstallCommandPreview(target: PackageTarget, zap = false): string {
    if (target.kind === 'formula') {
      return `brew uninstall --formula ${target.name}`;
    }

    return zap
      ? `brew uninstall --cask --zap ${target.name}`
      : `brew uninstall --cask ${target.name}`;
  }

  buildBatchCommandPreview(action: 'upgrade' | 'uninstall' | 'pin', items: PackageTarget[]): string {
    const names = items.map((item) => item.name).join(' ');
    switch (action) {
      case 'upgrade':
        return `brew upgrade ${names}`;
      case 'uninstall':
        return items.map((item) => this.buildUninstallCommandPreview(item)).join('\n');
      case 'pin':
        return items.map((item) => `brew pin ${item.name}`).join('\n');
      default:
        return '';
    }
  }

  async installOne(request: InstallOneRequest): Promise<boolean> {
    const result = await this.facade.installOne(request);
    if (result.success) {
      this.toast.push(`Installed ${request.name}.`, 'success');
    }
    return result.success;
  }

  async uninstallOne(request: UninstallOneRequest): Promise<boolean> {
    const result = await this.facade.uninstallOne(request);
    if (result.success) {
      this.toast.push(`Uninstalled ${request.name}.`, 'success');
    }
    return result.success;
  }

  async reinstallOne(request: ReinstallOneRequest): Promise<boolean> {
    const result = await this.facade.reinstallOne(request);
    if (result.success) {
      this.toast.push(`Reinstalled ${request.name}.`, 'success');
    }
    return result.success;
  }

  async upgradeOne(request: UpgradeOneRequest): Promise<boolean> {
    const result = await this.facade.upgradeOne(request);
    if (result.success) {
      this.toast.push(`Upgrade command started for ${request.name}.`, 'success');
    }
    return result.success;
  }

  async upgradeMany(request: BatchManyRequest): Promise<BatchJobResult> {
    const result = await this.facade.upgradeMany(request);
    this.toast.push(
      `Batch upgrade finished (${result.succeeded}/${request.items.length} succeeded).`,
      'success'
    );
    return result;
  }

  async uninstallMany(request: BatchManyRequest): Promise<BatchJobResult> {
    const result = await this.facade.uninstallMany(request);
    this.toast.push(
      `Batch uninstall finished (${result.succeeded}/${request.items.length} succeeded).`,
      'success'
    );
    return result;
  }

  async pinMany(request: BatchManyRequest): Promise<BatchJobResult> {
    const result = await this.facade.pinMany(request);
    this.toast.push(
      `Batch pin finished (${result.succeeded}/${request.items.length} succeeded).`,
      'success'
    );
    return result;
  }

  notifyPinSuccess(request: PinOneRequest): void {
    this.toast.pushWithAction(`Pinned ${request.name}.`, 'success', {
      label: 'Unpin',
      run: async () => {
        const unpin = await this.facade.unpinOne({ kind: request.kind, name: request.name });
        if (unpin.success) {
          this.toast.push(`Unpinned ${request.name}.`, 'success');
        }
      }
    });
  }

  notifyUnpinSuccess(name: string): void {
    this.toast.push(`Unpinned ${name}.`, 'success');
  }

  async runTemplate(request: TemplatesRunRequest, templateName: string): Promise<boolean> {
    const result = await this.facade.runTemplate(request);
    if (result.success) {
      this.toast.push(`Template "${templateName}" completed for ${request.name}.`, 'success');
    }
    return result.success;
  }

  async toggleSmartUpgradeBlocked(
    target: PackageTarget,
    currentlyBlocked: boolean,
    toggle: () => Promise<boolean>
  ): Promise<void> {
    const updated = await toggle();
    if (updated) {
      if (currentlyBlocked) {
        this.toast.push(`Allowed ${target.name} for smart upgrades.`, 'success');
      } else {
        this.toast.pushWithAction(`Excluded ${target.name} from smart upgrades.`, 'success', {
          label: 'Allow again',
          run: async () => {
            const allowed = await toggle();
            if (allowed) {
              this.toast.push(`Allowed ${target.name} for smart upgrades.`, 'success');
            }
          }
        });
      }
    }
  }
}
