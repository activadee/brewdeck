import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ZardDialogComponent, ZardDialogOptions } from './dialog.component';

describe('ZardDialogComponent', () => {
  it('creates and emits action outputs', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDialogComponent],
      providers: [{ provide: ZardDialogOptions, useValue: {} }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDialogComponent);
    const okSpy = vi.fn();
    const cancelSpy = vi.fn();
    fixture.componentInstance.okTriggered.subscribe(okSpy);
    fixture.componentInstance.cancelTriggered.subscribe(cancelSpy);
    fixture.detectChanges();

    fixture.componentInstance.onOkClick();
    fixture.componentInstance.onCloseClick();

    expect(fixture.componentInstance).toBeTruthy();
    expect(okSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });
});
