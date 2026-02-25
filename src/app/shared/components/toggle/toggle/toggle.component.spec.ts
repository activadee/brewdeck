import { TestBed } from '@angular/core/testing';

import { ZardToggleComponent } from './toggle.component';

describe('ZardToggleComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardToggleComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardToggleComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
