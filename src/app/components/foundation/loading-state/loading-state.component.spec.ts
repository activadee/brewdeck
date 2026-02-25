import { TestBed } from '@angular/core/testing';

import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoadingStateComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
