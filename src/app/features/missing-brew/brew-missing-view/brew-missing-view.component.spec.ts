import { TestBed } from '@angular/core/testing';

import { BrewMissingViewComponent } from './brew-missing-view.component';

describe('BrewMissingViewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [BrewMissingViewComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(BrewMissingViewComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
