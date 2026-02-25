import { TestBed } from '@angular/core/testing';

import { PackageMetaComponent } from './package-meta.component';

describe('PackageMetaComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageMetaComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageMetaComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
