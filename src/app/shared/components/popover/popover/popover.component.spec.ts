import { OverlayModule } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ZardPopoverDirective } from './popover.component';

@Component({
  standalone: true,
  imports: [ZardPopoverDirective],
  template: `
    <button zPopover [zContent]="content">Open</button>
    <ng-template #content>Content</ng-template>
  `,
})
class PopoverHostComponent {
  @ViewChild(ZardPopoverDirective, { static: true }) popover!: ZardPopoverDirective;
}

describe('ZardPopoverDirective', () => {
  it('creates from host usage', async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, PopoverHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PopoverHostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.popover).toBeTruthy();
  });
});
