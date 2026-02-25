import { TestBed } from '@angular/core/testing';

import { ZardAlertDialogOptions } from './alert-dialog.component';

describe('ZardAlertDialogOptions', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAlertDialogOptions],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAlertDialogOptions);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
