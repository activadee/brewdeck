import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ZardDropdownMenuComponent } from '../dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from './dropdown-item.component';
import { ZardDropdownService } from '../dropdown.service';

describe('ZardDropdownMenuItemComponent', () => {
  it('closes parent dropdown menu when available', async () => {
    vi.useFakeTimers();
    const service = { close: vi.fn() };
    const menu = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ZardDropdownMenuItemComponent],
      providers: [
        { provide: ZardDropdownService, useValue: service },
        { provide: ZardDropdownMenuComponent, useValue: menu }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDropdownMenuItemComponent);
    fixture.componentInstance.onClick();
    vi.runAllTimers();

    expect(menu.close).toHaveBeenCalledTimes(1);
    expect(service.close).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('falls back to dropdown service when no parent menu is present', async () => {
    vi.useFakeTimers();
    const service = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ZardDropdownMenuItemComponent],
      providers: [{ provide: ZardDropdownService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDropdownMenuItemComponent);
    fixture.componentInstance.onClick();
    vi.runAllTimers();

    expect(service.close).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does not close dropdowns when disabled', async () => {
    vi.useFakeTimers();
    const service = { close: vi.fn() };
    const menu = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ZardDropdownMenuItemComponent],
      providers: [
        { provide: ZardDropdownService, useValue: service },
        { provide: ZardDropdownMenuComponent, useValue: menu }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDropdownMenuItemComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    fixture.componentInstance.onClick();
    vi.runAllTimers();

    expect(menu.close).not.toHaveBeenCalled();
    expect(service.close).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
