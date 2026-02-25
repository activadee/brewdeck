import { TestBed } from '@angular/core/testing';

import { ZardIconComponent } from './icon.component';

describe('ZardIconComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardIconComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardIconComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
