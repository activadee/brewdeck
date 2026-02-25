import { TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
