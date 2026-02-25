import { TestBed } from '@angular/core/testing';

import { ZardResizableComponent } from './resizable.component';

describe('ZardResizableComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardResizableComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardResizableComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
