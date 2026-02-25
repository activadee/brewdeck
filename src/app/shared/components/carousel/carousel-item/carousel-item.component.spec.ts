import { TestBed } from '@angular/core/testing';

import { ZardCarouselItemComponent } from './carousel-item.component';

describe('ZardCarouselItemComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCarouselItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCarouselItemComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
