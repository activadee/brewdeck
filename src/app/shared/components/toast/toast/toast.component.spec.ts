import { TestBed } from '@angular/core/testing';

import { ZardToastComponent } from './toast.component';

describe('ZardToastComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardToastComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardToastComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
