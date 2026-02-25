import { TestBed } from '@angular/core/testing';

import { PackageSearchInputComponent } from './package-search-input.component';

describe('PackageSearchInputComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageSearchInputComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageSearchInputComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
