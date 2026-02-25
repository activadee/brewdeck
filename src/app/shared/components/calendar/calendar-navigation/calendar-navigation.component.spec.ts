import { TestBed } from '@angular/core/testing';

import { ZardCalendarNavigationComponent } from './calendar-navigation.component';

describe('ZardCalendarNavigationComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCalendarNavigationComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCalendarNavigationComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
