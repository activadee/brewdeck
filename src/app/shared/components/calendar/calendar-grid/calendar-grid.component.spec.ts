import { TestBed } from '@angular/core/testing';

import { ZardCalendarGridComponent } from './calendar-grid.component';

describe('ZardCalendarGridComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCalendarGridComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCalendarGridComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
