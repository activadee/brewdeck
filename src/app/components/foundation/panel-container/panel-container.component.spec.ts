import { TestBed } from '@angular/core/testing';

import { PanelContainerComponent } from './panel-container.component';

describe('PanelContainerComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PanelContainerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PanelContainerComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
