import { TestBed } from '@angular/core/testing';

import { ZardTreeNodeComponent } from './tree-node.component';

describe('ZardTreeNodeComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTreeNodeComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTreeNodeComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
