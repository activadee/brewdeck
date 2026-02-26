import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ZardSheetComponent, ZardSheetOptions } from './sheet.component';

describe('ZardSheetComponent', () => {
  it('creates and emits action outputs', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSheetComponent],
      providers: [{ provide: ZardSheetOptions, useValue: {} }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSheetComponent);
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
