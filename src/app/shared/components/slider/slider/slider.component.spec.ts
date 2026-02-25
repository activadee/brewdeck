import { TestBed } from '@angular/core/testing';

import { ZSliderTrackComponent } from './slider.component';

describe('ZSliderTrackComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZSliderTrackComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZSliderTrackComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
