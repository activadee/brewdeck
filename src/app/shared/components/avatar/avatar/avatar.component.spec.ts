import { TestBed } from '@angular/core/testing';

import { ZardAvatarComponent } from './avatar.component';

describe('ZardAvatarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAvatarComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAvatarComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
