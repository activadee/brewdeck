import { TestBed } from '@angular/core/testing';

import { ZardResizableHandleComponent } from './resizable-handle.component';

describe('ZardResizableHandleComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardResizableHandleComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardResizableHandleComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
