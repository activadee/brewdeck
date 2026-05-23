import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastAction {
  label: string;
  run: () => void | Promise<void>;
}

export interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  push(message: string, kind: ToastKind = 'info', durationMs = 4_000): void {
    this.pushWithAction(message, kind, undefined, durationMs);
  }

  pushWithAction(
    message: string,
    kind: ToastKind = 'info',
    action?: ToastAction,
    durationMs = action ? 8_000 : 4_000
  ): void {
    const id = crypto.randomUUID();
    this.toasts.update((current) => [...current, { id, message, kind, action }]);

    window.setTimeout(() => this.dismiss(id), durationMs);
  }

  async runAction(id: string): Promise<void> {
    const toast = this.toasts().find((item) => item.id === id);
    if (!toast?.action) {
      return;
    }

    await toast.action.run();
    this.dismiss(id);
  }

  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((item) => item.id !== id));
  }
}
