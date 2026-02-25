import { TestBed } from '@angular/core/testing';

import { ZardButtonComponent } from './button.component';

describe('ZardButtonComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardButtonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardButtonComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
