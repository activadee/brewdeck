import { TestBed } from '@angular/core/testing';

import { ZardDialogOptions } from './dialog.component';

describe('ZardDialogOptions', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDialogOptions],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDialogOptions);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
