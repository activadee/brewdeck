import { TestBed } from '@angular/core/testing';

import { ZardCommandInputComponent } from './command-input.component';

describe('ZardCommandInputComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandInputComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandInputComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
