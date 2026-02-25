import { TestBed } from '@angular/core/testing';

import { ZardSelectComponent } from './select.component';

describe('ZardSelectComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSelectComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
