import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CleanupConfirmDialogComponent } from './cleanup-confirm-dialog.component';

describe('CleanupConfirmDialogComponent', () => {
  it('creates the component', async () => {
    await TestBed.configureTestingModule({
      imports: [CleanupConfirmDialogComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(CleanupConfirmDialogComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
