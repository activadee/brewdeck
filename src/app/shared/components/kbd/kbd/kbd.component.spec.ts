import { TestBed } from '@angular/core/testing';

import { ZardKbdComponent } from './kbd.component';

describe('ZardKbdComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardKbdComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardKbdComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
