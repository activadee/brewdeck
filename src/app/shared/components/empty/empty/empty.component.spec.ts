import { TestBed } from '@angular/core/testing';

import { ZardEmptyComponent } from './empty.component';

describe('ZardEmptyComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardEmptyComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardEmptyComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
