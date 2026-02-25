import { TestBed } from '@angular/core/testing';

import { ZardDropdownMenuContentComponent } from './dropdown-menu-content.component';

describe('ZardDropdownMenuContentComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardDropdownMenuContentComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardDropdownMenuContentComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
