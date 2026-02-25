import { TestBed } from '@angular/core/testing';

import { ZardCommandOptionGroupComponent } from './command-option-group.component';

describe('ZardCommandOptionGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandOptionGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandOptionGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
