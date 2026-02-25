import { TestBed } from '@angular/core/testing';

import { ZardSwitchComponent } from './switch.component';

describe('ZardSwitchComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSwitchComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSwitchComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
