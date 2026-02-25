import { TestBed } from '@angular/core/testing';

import { PackageRowOverflowMenuComponent } from './package-row-overflow-menu.component';

describe('PackageRowOverflowMenuComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageRowOverflowMenuComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageRowOverflowMenuComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
