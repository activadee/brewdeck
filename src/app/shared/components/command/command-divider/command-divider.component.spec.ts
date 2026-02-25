import { TestBed } from '@angular/core/testing';

import { ZardCommandDividerComponent } from './command-divider.component';

describe('ZardCommandDividerComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardCommandDividerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardCommandDividerComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
