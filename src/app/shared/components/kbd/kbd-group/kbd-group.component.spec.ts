import { TestBed } from '@angular/core/testing';

import { ZardKbdGroupComponent } from './kbd-group.component';

describe('ZardKbdGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardKbdGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardKbdGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
