import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ZardTreeService } from '../tree.service';
import { ZardTreeNodeContentComponent } from './tree-node-content.component';

describe('ZardTreeNodeContentComponent', () => {
  it('creates with required inputs', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTreeNodeContentComponent],
      providers: [ZardTreeService],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTreeNodeContentComponent);
    fixture.componentRef.setInput('nodeKey', 'node-1');
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
