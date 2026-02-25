import { TestBed } from '@angular/core/testing';

import { ZardCardComponent } from './card.component';

describe('ZardCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCardComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
