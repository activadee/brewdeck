import { TestBed } from '@angular/core/testing';

import { ZardDividerComponent } from './divider.component';

describe('ZardDividerComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDividerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDividerComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
