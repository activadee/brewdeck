import { TestBed } from '@angular/core/testing';

import { ZardDatePickerComponent } from './date-picker.component';

describe('ZardDatePickerComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDatePickerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDatePickerComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
