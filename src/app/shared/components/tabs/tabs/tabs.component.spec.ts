import { TestBed } from '@angular/core/testing';

import { ZardTabComponent } from './tabs.component';

describe('ZardTabComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTabComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTabComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
