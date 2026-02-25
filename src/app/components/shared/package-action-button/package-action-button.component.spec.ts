import { TestBed } from '@angular/core/testing';

import { PackageActionButtonComponent } from './package-action-button.component';

describe('PackageActionButtonComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PackageActionButtonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageActionButtonComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
