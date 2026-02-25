import { TestBed } from '@angular/core/testing';

import { ZardCalendarComponent } from './calendar.component';

describe('ZardCalendarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCalendarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCalendarComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
