import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ZardCarouselComponent } from '../carousel/carousel.component';
import { ZardCarouselItemComponent } from './carousel-item.component';

describe('ZardCarouselItemComponent', () => {
  it('creates with carousel parent context', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCarouselItemComponent],
      providers: [{ provide: ZardCarouselComponent, useValue: { zOrientation: () => 'horizontal' } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCarouselItemComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
