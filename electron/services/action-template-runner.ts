import { randomUUID } from 'node:crypto';

import type {
  ActionTemplateStep,
  BrewJobCompleteEvent,
  BrewJobFailedEvent,
  BrewJobProgressEvent,
  JobEventSink,
  PackageKind,
  TemplatesRunRequest
} from '../../src/shared/contracts';
import type { ActionTemplatesStore } from './action-templates-store';
import type { HomebrewService } from './homebrew-service';
import type { JobEventBridge } from './job-event-bridge';

const ALLOWED_TRANSITIONS: Record<ActionTemplateStep['action'], ActionTemplateStep['action'][]> = {
  install: ['pin', 'upgradeOne'],
  pin: [],
  unpin: ['pin'],
  upgradeOne: ['pin']
};

export class ActionTemplateRunner {
  constructor(
    private readonly templatesStore: ActionTemplatesStore,
    private readonly homebrew: HomebrewService,
    private readonly jobBridge: JobEventBridge
  ) {}

  validateSteps(steps: ActionTemplateStep[]): void {
    if (steps.length === 0) {
      throw new Error('Template must include at least one step.');
    }

    for (let index = 0; index < steps.length - 1; index += 1) {
      const current = steps[index]!.action;
      const next = steps[index + 1]!.action;
      const allowed = ALLOWED_TRANSITIONS[current] ?? [];
      if (!allowed.includes(next)) {
        throw new Error(`Step transition not allowed: ${current} → ${next}`);
      }
    }

    if (steps.some((step) => step.action === 'pin') && kindWouldBeCaskOnly(steps)) {
      throw new Error('Pin steps require formula targets.');
    }
  }

  async run(request: TemplatesRunRequest, sink: JobEventSink): Promise<BrewJobCompleteEvent> {
    const template = this.templatesStore.getById(request.templateId);
    if (!template) {
      throw new Error('Template not found.');
    }

    this.validateSteps(template.steps);

    const parentJobId = randomUUID();
    this.jobBridge.registerJob(parentJobId, 'template');

    let lastResult: BrewJobCompleteEvent | null = null;
    const stepTotal = template.steps.length;

    for (let stepIndex = 0; stepIndex < template.steps.length; stepIndex += 1) {
      const step = template.steps[stepIndex]!;
      const wrappedSink = wrapSinkWithParent(sink, parentJobId, stepIndex, stepTotal);

      lastResult = await this.runStep(step, request.kind, request.name, wrappedSink);
      if (!lastResult.success) {
        return { ...lastResult, source: 'template', correlationId: parentJobId, stepIndex, stepTotal };
      }
    }

    return (
      lastResult ?? {
        jobId: parentJobId,
        action: 'install',
        command: `template:${template.name}`,
        kind: request.kind,
        packageName: request.name,
        success: true,
        exitCode: 0,
        durationMs: 0,
        output: '',
        timestamp: new Date().toISOString(),
        source: 'template',
        correlationId: parentJobId
      }
    );
  }

  private async runStep(
    step: ActionTemplateStep,
    kind: PackageKind,
    name: string,
    sink: JobEventSink
  ): Promise<BrewJobCompleteEvent> {
    switch (step.action) {
      case 'install':
        return this.homebrew.installOne({ kind, name }, sink);
      case 'pin':
        if (kind !== 'formula') {
          throw new Error('Pin is only supported for formulae.');
        }
        return this.homebrew.pinOne({ kind: 'formula', name }, sink);
      case 'unpin':
        return this.homebrew.unpinOne({ kind: 'formula', name }, sink);
      case 'upgradeOne':
        return this.homebrew.upgradeOne({ kind, name }, sink);
      default:
        throw new Error(`Unsupported template step.`);
    }
  }
}

function kindWouldBeCaskOnly(steps: ActionTemplateStep[]): boolean {
  return steps.every((step) => step.action === 'install');
}

function wrapSinkWithParent(
  sink: JobEventSink,
  correlationId: string,
  stepIndex: number,
  stepTotal: number
): JobEventSink {
  const attribution = {
    source: 'template' as const,
    correlationId,
    stepIndex,
    stepTotal
  };

  return {
    onProgress(event: BrewJobProgressEvent) {
      sink.onProgress({ ...event, ...attribution });
    },
    onComplete(event: BrewJobCompleteEvent) {
      sink.onComplete({ ...event, ...attribution });
    },
    onFailed(event: BrewJobFailedEvent) {
      sink.onFailed({ ...event, ...attribution });
    }
  };
}
