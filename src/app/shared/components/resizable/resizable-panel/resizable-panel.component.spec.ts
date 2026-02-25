import { TestBed } from '@angular/core/testing';

import { ZardResizablePanelComponent } from './resizable-panel.component';

describe('ZardResizablePanelComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardResizablePanelComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardResizablePanelComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
