import { TestBed } from '@angular/core/testing';

import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(LayoutComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
