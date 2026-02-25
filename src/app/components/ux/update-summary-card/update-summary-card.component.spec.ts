import { TestBed } from '@angular/core/testing';

import { UpdateSummaryCardComponent } from './update-summary-card.component';

describe('UpdateSummaryCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSummaryCardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UpdateSummaryCardComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
