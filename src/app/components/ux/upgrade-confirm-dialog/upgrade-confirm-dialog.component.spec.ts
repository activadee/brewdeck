import { TestBed } from '@angular/core/testing';

import { UpgradeConfirmDialogComponent } from './upgrade-confirm-dialog.component';

describe('UpgradeConfirmDialogComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeConfirmDialogComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UpgradeConfirmDialogComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
