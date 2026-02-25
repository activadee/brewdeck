import { TestBed } from '@angular/core/testing';

import { ZardSegmentedItemComponent } from './segmented.component';

describe('ZardSegmentedItemComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSegmentedItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSegmentedItemComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
