import { TestBed } from '@angular/core/testing';

import { ZardRadioComponent } from './radio.component';

describe('ZardRadioComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardRadioComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardRadioComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
