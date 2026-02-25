import { TestBed } from '@angular/core/testing';

import { ZardCommandOptionComponent } from './command-option.component';

describe('ZardCommandOptionComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandOptionComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandOptionComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
