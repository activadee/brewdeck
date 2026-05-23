import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardDividerComponent } from '@/shared/components/divider';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSegmentedComponent, type SegmentedOption } from '@/shared/components/segmented';
import { ZardSwitchComponent } from '@/shared/components/switch';
import type { ActionTemplateStep } from '../../../../shared/contracts';
import { PackageActionsService } from '../../../core/services/package-actions.service';
import { TemplatesStore } from '../../../core/stores/templates.store';
import { SettingsStore } from '../../../core/stores/settings.store';

const STEP_OPTIONS: ActionTemplateStep['action'][] = ['install', 'pin', 'unpin', 'upgradeOne'];

@Component({
  selector: 'app-settings-view',
  imports: [
    ReactiveFormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardDividerComponent,
    ZardInputDirective,
    ZardSegmentedComponent,
    ZardSwitchComponent
  ],
  templateUrl: './settings-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './settings-view.component.css',
})
export class SettingsViewComponent {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly templatesStore = inject(TemplatesStore);
  private readonly packageActions = inject(PackageActionsService);

  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly stepOptions = STEP_OPTIONS;
  protected readonly editingTemplateId = signal<string | null>(null);
  protected readonly templateName = signal('New template');
  protected readonly templateSteps = signal<ActionTemplateStep[]>([{ action: 'install' }]);
  protected readonly templateError = signal<string | null>(null);

  protected readonly intervalOptions: SegmentedOption[] = [
    { value: '60', label: '1h' },
    { value: '360', label: '6h' },
    { value: '1440', label: '24h' }
  ];

  protected readonly defaultViewOptions: SegmentedOption[] = [
    { value: 'updates', label: 'Updates' },
    { value: 'installed', label: 'Installed' },
    { value: 'browse', label: 'Browse' }
  ];

  protected readonly form = this.fb.group({
    checkIntervalMinutes: '360' as '60' | '360' | '1440',
    autoCheckOnLaunch: true,
    trayNotifyOnUpdates: true,
    scheduledMetadataSyncEnabled: true,
    scheduledCleanupEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    defaultView: 'updates' as 'updates' | 'installed' | 'browse',
    showAdvancedInstallOptions: false,
    telemetryEnabled: false
  });

  constructor() {
    void this.templatesStore.load();
    effect(() => {
      const settings = this.settingsStore.settings();
      this.form.patchValue(
        {
          checkIntervalMinutes: String(settings.checkIntervalMinutes) as '60' | '360' | '1440',
          autoCheckOnLaunch: settings.autoCheckOnLaunch,
          trayNotifyOnUpdates: settings.trayNotifyOnUpdates,
          scheduledMetadataSyncEnabled: settings.scheduledMetadataSyncEnabled,
          scheduledCleanupEnabled: settings.scheduledCleanupEnabled,
          quietHoursEnabled: settings.quietHoursEnabled,
          quietHoursStart: settings.quietHoursStart,
          quietHoursEnd: settings.quietHoursEnd,
          defaultView: settings.defaultView,
          showAdvancedInstallOptions: settings.showAdvancedInstallOptions,
          telemetryEnabled: settings.telemetryEnabled
        },
        { emitEvent: false }
      );
    });
  }

  protected startNewTemplate(): void {
    this.editingTemplateId.set(null);
    this.templateName.set('New template');
    this.templateSteps.set([{ action: 'install' }]);
    this.templateError.set(null);
  }

  protected editTemplate(id: string): void {
    const template = this.templatesStore.templates().find((item) => item.id === id);
    if (!template) {
      return;
    }
    this.editingTemplateId.set(id);
    this.templateName.set(template.name);
    this.templateSteps.set([...template.steps]);
    this.templateError.set(null);
  }

  protected addStep(): void {
    if (this.templateSteps().length >= 10) {
      return;
    }
    this.templateSteps.update((steps) => [...steps, { action: 'pin' }]);
  }

  protected removeStep(index: number): void {
    this.templateSteps.update((steps) => steps.filter((_, stepIndex) => stepIndex !== index));
  }

  protected moveStep(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;
    const steps = [...this.templateSteps()];
    if (nextIndex < 0 || nextIndex >= steps.length) {
      return;
    }
    const [item] = steps.splice(index, 1);
    steps.splice(nextIndex, 0, item!);
    this.templateSteps.set(steps);
  }

  protected updateStepAction(index: number, action: ActionTemplateStep['action']): void {
    this.templateSteps.update((steps) =>
      steps.map((step, stepIndex) => (stepIndex === index ? { action } : step))
    );
  }

  protected async saveTemplateDraft(): Promise<void> {
    const validationError = this.packageActions.validateTemplateSteps(this.templateSteps());
    if (validationError) {
      this.templateError.set(validationError);
      return;
    }

    try {
      await this.templatesStore.save({
        id: this.editingTemplateId() ?? undefined,
        name: this.templateName().trim(),
        steps: this.templateSteps()
      });
      this.templateError.set(null);
      this.startNewTemplate();
    } catch (error) {
      this.templateError.set((error as Error).message);
    }
  }

  protected async deleteTemplate(id: string): Promise<void> {
    try {
      await this.templatesStore.remove(id);
      if (this.editingTemplateId() === id) {
        this.startNewTemplate();
      }
    } catch (error) {
      this.templateError.set((error as Error).message);
    }
  }

  protected async save(): Promise<void> {
    const value = this.form.getRawValue();
    await this.settingsStore.update({
      checkIntervalMinutes: Number(value.checkIntervalMinutes) as 60 | 360 | 1440,
      autoCheckOnLaunch: value.autoCheckOnLaunch,
      trayNotifyOnUpdates: value.trayNotifyOnUpdates,
      scheduledMetadataSyncEnabled: value.scheduledMetadataSyncEnabled,
      scheduledCleanupEnabled: value.scheduledCleanupEnabled,
      quietHoursEnabled: value.quietHoursEnabled,
      quietHoursStart: value.quietHoursStart,
      quietHoursEnd: value.quietHoursEnd,
      defaultView: value.defaultView,
      showAdvancedInstallOptions: value.showAdvancedInstallOptions,
      telemetryEnabled: value.telemetryEnabled
    });
  }

  protected resetForm(): void {
    const settings = this.settingsStore.settings();
    this.form.patchValue({
      checkIntervalMinutes: String(settings.checkIntervalMinutes) as '60' | '360' | '1440',
      autoCheckOnLaunch: settings.autoCheckOnLaunch,
      trayNotifyOnUpdates: settings.trayNotifyOnUpdates,
      scheduledMetadataSyncEnabled: settings.scheduledMetadataSyncEnabled,
      scheduledCleanupEnabled: settings.scheduledCleanupEnabled,
      quietHoursEnabled: settings.quietHoursEnabled,
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
      defaultView: settings.defaultView,
      showAdvancedInstallOptions: settings.showAdvancedInstallOptions,
      telemetryEnabled: settings.telemetryEnabled
    });
  }
}
