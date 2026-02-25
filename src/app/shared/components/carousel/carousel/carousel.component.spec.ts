import { TestBed } from '@angular/core/testing';

import { ZardCarouselComponent } from './carousel.component';

describe('ZardCarouselComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCarouselComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCarouselComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
