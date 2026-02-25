import { TestBed } from '@angular/core/testing';

import { ZardTableComponent } from './table.component';

describe('ZardTableComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTableComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTableComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
