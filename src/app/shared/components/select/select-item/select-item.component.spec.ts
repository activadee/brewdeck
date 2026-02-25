import { TestBed } from '@angular/core/testing';

import { ZardSelectItemComponent } from './select-item.component';

describe('ZardSelectItemComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardSelectItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardSelectItemComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
