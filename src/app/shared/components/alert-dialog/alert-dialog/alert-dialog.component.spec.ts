import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ZardAlertDialogComponent, ZardAlertDialogOptions } from './alert-dialog.component';

describe('ZardAlertDialogComponent', () => {
  it('creates and emits action outputs', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAlertDialogComponent],
      providers: [{ provide: ZardAlertDialogOptions, useValue: {} }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAlertDialogComponent);
    const okSpy = vi.fn();
    const cancelSpy = vi.fn();
    fixture.componentInstance.okTriggered.subscribe(okSpy);
    fixture.componentInstance.cancelTriggered.subscribe(cancelSpy);
    fixture.detectChanges();

    fixture.componentInstance.onOkClick();
    fixture.componentInstance.onCancelClick();

    expect(fixture.componentInstance).toBeTruthy();
    expect(okSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });
});
