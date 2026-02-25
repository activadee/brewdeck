import { TestBed } from '@angular/core/testing';

import { ZardFormFieldComponent } from './form.component';

describe('ZardFormFieldComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardFormFieldComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardFormFieldComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
