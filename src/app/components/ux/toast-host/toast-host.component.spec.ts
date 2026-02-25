import { TestBed } from '@angular/core/testing';

import { ToastHostComponent } from './toast-host.component';

describe('ToastHostComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ToastHostComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
