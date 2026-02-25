import { TestBed } from '@angular/core/testing';

import { UninstallConfirmDialogComponent } from './uninstall-confirm-dialog.component';

describe('UninstallConfirmDialogComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [UninstallConfirmDialogComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UninstallConfirmDialogComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
