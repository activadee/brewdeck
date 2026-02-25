import { TestBed } from '@angular/core/testing';

import { PackageRowComponent } from './package-row.component';

describe('PackageRowComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageRowComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageRowComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
