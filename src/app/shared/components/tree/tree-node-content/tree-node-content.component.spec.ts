import { TestBed } from '@angular/core/testing';

import { ZardTreeNodeContentComponent } from './tree-node-content.component';

describe('ZardTreeNodeContentComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTreeNodeContentComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTreeNodeContentComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
