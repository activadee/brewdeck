import { TestBed } from '@angular/core/testing';

import { PackageFilterChipsComponent } from './package-filter-chips.component';

describe('PackageFilterChipsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageFilterChipsComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageFilterChipsComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
