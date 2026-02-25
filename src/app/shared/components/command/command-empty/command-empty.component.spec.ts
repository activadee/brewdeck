import { TestBed } from '@angular/core/testing';

import { ZardCommandEmptyComponent } from './command-empty.component';

describe('ZardCommandEmptyComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandEmptyComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandEmptyComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
