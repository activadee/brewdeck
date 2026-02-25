import { TestBed } from '@angular/core/testing';

import { ZardComboboxComponent } from './combobox.component';

describe('ZardComboboxComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardComboboxComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardComboboxComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
