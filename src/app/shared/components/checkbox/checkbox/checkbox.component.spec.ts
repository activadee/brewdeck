import { TestBed } from '@angular/core/testing';

import { ZardCheckboxComponent } from './checkbox.component';

describe('ZardCheckboxComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCheckboxComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCheckboxComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
