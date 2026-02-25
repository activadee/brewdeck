import { TestBed } from '@angular/core/testing';

import { ZardAlertComponent } from './alert.component';

describe('ZardAlertComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAlertComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAlertComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
