import { TestBed } from '@angular/core/testing';

import { ZardSheetOptions } from './sheet.component';

describe('ZardSheetOptions', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSheetOptions],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSheetOptions);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
