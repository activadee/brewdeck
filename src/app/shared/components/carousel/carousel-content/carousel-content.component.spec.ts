import { TestBed } from '@angular/core/testing';

import { ZardCarouselContentComponent } from './carousel-content.component';

describe('ZardCarouselContentComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCarouselContentComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCarouselContentComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
