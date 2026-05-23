import { randomUUID } from 'node:crypto';

import {
  actionTemplateSchema,
  templatesSaveRequestSchema,
  type ActionTemplate,
  type TemplatesSaveRequest
} from '../../src/shared/contracts';
import type { SettingsStore } from './settings-store';

const MAX_TEMPLATES = 20;

export class ActionTemplatesStore {
  constructor(private readonly settingsStore: SettingsStore) {}

  list(): ActionTemplate[] {
    return this.getTemplates();
  }

  save(request: TemplatesSaveRequest): ActionTemplate {
    const parsed = templatesSaveRequestSchema.parse(request);
    const now = new Date().toISOString();
    const templates = this.getTemplates();
    const existingIndex = parsed.id ? templates.findIndex((template) => template.id === parsed.id) : -1;

    const template = actionTemplateSchema.parse({
      id: parsed.id ?? randomUUID(),
      name: parsed.name,
      steps: parsed.steps,
      createdAt: existingIndex >= 0 ? templates[existingIndex]!.createdAt : now,
      updatedAt: now
    });

    const next =
      existingIndex >= 0
        ? templates.map((entry, index) => (index === existingIndex ? template : entry))
        : [...templates, template];

    if (next.length > MAX_TEMPLATES) {
      throw new Error(`Maximum of ${MAX_TEMPLATES} templates allowed.`);
    }

    this.persist(next);
    return template;
  }

  delete(id: string): void {
    const next = this.getTemplates().filter((template) => template.id !== id);
    this.persist(next);
  }

  getById(id: string): ActionTemplate | null {
    return this.getTemplates().find((template) => template.id === id) ?? null;
  }

  private getTemplates(): ActionTemplate[] {
    const settings = this.settingsStore.getSettings() as AppSettingsWithTemplates;
    const raw = settings.actionTemplates;
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((entry) => {
        const parsed = actionTemplateSchema.safeParse(entry);
        return parsed.success ? parsed.data : null;
      })
      .filter((entry): entry is ActionTemplate => entry !== null);
  }

  private persist(templates: ActionTemplate[]): void {
    this.settingsStore.updateSettings({ actionTemplates: templates } as never);
  }
}

interface AppSettingsWithTemplates {
  actionTemplates?: ActionTemplate[];
}
