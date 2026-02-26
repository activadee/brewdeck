import { TestBed } from '@angular/core/testing';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ZardToastComponent } from './toast.component';

describe('ZardToastComponent', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardToastComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardToastComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
