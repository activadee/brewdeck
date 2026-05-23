import { describe, expect, it, vi } from 'vitest';

import type { ActionTemplate, BrewJobCompleteEvent, JobEventSink } from '../../src/shared/contracts';
import { ActionTemplateRunner } from './action-template-runner';
import type { ActionTemplatesStore } from './action-templates-store';
import type { HomebrewService } from './homebrew-service';
import type { JobEventBridge } from './job-event-bridge';

describe('ActionTemplateRunner', () => {
  it('blocks invalid step transitions', () => {
    const runner = createRunner();
    expect(() =>
      runner.validateSteps([{ action: 'pin' }, { action: 'install' }])
    ).toThrow(/not allowed/);
  });

  it('stops chain on first failed step', async () => {
    const homebrew = {
      installOne: vi.fn(async () => successEvent('install')),
      pinOne: vi.fn(async () => ({ ...successEvent('pin'), success: false, exitCode: 1 }))
    } as unknown as HomebrewService;

    const runner = createRunner({ homebrew });
    const result = await runner.run(
      { templateId: 't1', kind: 'formula', name: 'foo' },
      noopSink()
    );

    expect(result.success).toBe(false);
    expect(homebrew.installOne).toHaveBeenCalledOnce();
    expect(homebrew.pinOne).toHaveBeenCalledOnce();
  });
});

function createRunner(overrides?: { homebrew?: HomebrewService }): ActionTemplateRunner {
  const template: ActionTemplate = {
    id: 't1',
    name: 'Install + pin',
    steps: [{ action: 'install' }, { action: 'pin' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const templatesStore = {
    getById: () => template
  } as unknown as ActionTemplatesStore;

  const homebrew =
    overrides?.homebrew ??
    ({
      installOne: vi.fn(async () => successEvent('install')),
      pinOne: vi.fn(async () => successEvent('pin'))
    } as unknown as HomebrewService);

  const jobBridge = { registerJob: vi.fn() } as unknown as JobEventBridge;

  return new ActionTemplateRunner(templatesStore, homebrew, jobBridge);
}

function successEvent(action: BrewJobCompleteEvent['action']): BrewJobCompleteEvent {
  return {
    jobId: 'job-1',
    action,
    command: `brew ${action}`,
    kind: 'formula',
    packageName: 'foo',
    success: true,
    exitCode: 0,
    durationMs: 1,
    output: '',
    timestamp: new Date().toISOString()
  };
}

function noopSink(): JobEventSink {
  return {
    onProgress: () => undefined,
    onComplete: () => undefined,
    onFailed: () => undefined
  };
}
