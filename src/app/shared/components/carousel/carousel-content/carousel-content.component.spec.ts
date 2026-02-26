import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ZardCarouselComponent } from '../carousel/carousel.component';
import { ZardCarouselContentComponent } from './carousel-content.component';

describe('ZardCarouselContentComponent', () => {
  it('creates with carousel parent context', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCarouselContentComponent],
      providers: [{ provide: ZardCarouselComponent, useValue: { zOrientation: () => 'horizontal' } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCarouselContentComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
