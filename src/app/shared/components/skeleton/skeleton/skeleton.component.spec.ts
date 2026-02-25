import { TestBed } from '@angular/core/testing';

import { ZardSkeletonComponent } from './skeleton.component';

describe('ZardSkeletonComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSkeletonComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
