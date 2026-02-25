import { TestBed } from '@angular/core/testing';

import { ZardBreadcrumbEllipsisComponent } from './breadcrumb.component';

describe('ZardBreadcrumbEllipsisComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardBreadcrumbEllipsisComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardBreadcrumbEllipsisComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
