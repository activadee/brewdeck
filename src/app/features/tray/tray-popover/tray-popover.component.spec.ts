import { TestBed } from '@angular/core/testing';

import { TrayPopoverComponent } from './tray-popover.component';

describe('TrayPopoverComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TrayPopoverComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TrayPopoverComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
