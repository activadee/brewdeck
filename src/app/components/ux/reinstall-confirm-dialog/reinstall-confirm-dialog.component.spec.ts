import { TestBed } from '@angular/core/testing';

import { ReinstallConfirmDialogComponent } from './reinstall-confirm-dialog.component';

describe('ReinstallConfirmDialogComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ReinstallConfirmDialogComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReinstallConfirmDialogComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
