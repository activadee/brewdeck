import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ZardTreeService } from '../tree.service';
import { ZardTreeNodeComponent } from './tree-node.component';

describe('ZardTreeNodeComponent', () => {
  it('creates with required inputs', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTreeNodeComponent],
      providers: [ZardTreeService],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTreeNodeComponent);
    fixture.componentRef.setInput('node', { key: 'node-1', label: 'Node 1' });
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
