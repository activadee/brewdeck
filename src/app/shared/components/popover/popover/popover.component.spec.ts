import { TestBed } from '@angular/core/testing';

import { ZardPopoverDirective } from './popover.component';

describe('ZardPopoverDirective', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardPopoverDirective],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardPopoverDirective);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
