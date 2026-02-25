import { TestBed } from '@angular/core/testing';

import { ZardDropdownMenuComponent } from './dropdown.component';

describe('ZardDropdownMenuComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDropdownMenuComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDropdownMenuComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
