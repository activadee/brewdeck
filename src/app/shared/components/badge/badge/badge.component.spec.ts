import { TestBed } from '@angular/core/testing';

import { ZardBadgeComponent } from './badge.component';

describe('ZardBadgeComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardBadgeComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardBadgeComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
