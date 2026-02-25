import { TestBed } from '@angular/core/testing';

import { ZardButtonGroupComponent } from './button-group.component';

describe('ZardButtonGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardButtonGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardButtonGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
