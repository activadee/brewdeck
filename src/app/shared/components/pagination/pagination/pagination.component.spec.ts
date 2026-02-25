import { TestBed } from '@angular/core/testing';

import { ZardPaginationContentComponent } from './pagination.component';

describe('ZardPaginationContentComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardPaginationContentComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardPaginationContentComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
