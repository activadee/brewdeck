import { TestBed } from '@angular/core/testing';

import { ZardAvatarGroupComponent } from './avatar-group.component';

describe('ZardAvatarGroupComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAvatarGroupComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAvatarGroupComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
