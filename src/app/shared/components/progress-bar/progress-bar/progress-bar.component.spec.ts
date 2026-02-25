import { TestBed } from '@angular/core/testing';

import { ZardProgressBarComponent } from './progress-bar.component';

describe('ZardProgressBarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardProgressBarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardProgressBarComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
