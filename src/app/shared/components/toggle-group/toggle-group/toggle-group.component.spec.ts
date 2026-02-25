import { TestBed } from '@angular/core/testing';

import { ZardToggleGroupComponent } from './toggle-group.component';

describe('ZardToggleGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardToggleGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardToggleGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
