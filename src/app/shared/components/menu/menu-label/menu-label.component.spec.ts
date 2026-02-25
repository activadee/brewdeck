import { TestBed } from '@angular/core/testing';

import { ZardMenuLabelComponent } from './menu-label.component';

describe('ZardMenuLabelComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardMenuLabelComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardMenuLabelComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
