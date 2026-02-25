import { TestBed } from '@angular/core/testing';

import { ZardInputGroupComponent } from './input-group.component';

describe('ZardInputGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardInputGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardInputGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
