import { TestBed } from '@angular/core/testing';

import { ZardCommandComponent } from './command.component';

describe('ZardCommandComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
