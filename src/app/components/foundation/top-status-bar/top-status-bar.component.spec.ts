import { TestBed } from '@angular/core/testing';

import { TopStatusBarComponent } from './top-status-bar.component';

describe('TopStatusBarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TopStatusBarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TopStatusBarComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
