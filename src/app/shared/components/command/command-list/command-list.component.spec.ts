import { TestBed } from '@angular/core/testing';

import { ZardCommandListComponent } from './command-list.component';

describe('ZardCommandListComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandListComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandListComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
