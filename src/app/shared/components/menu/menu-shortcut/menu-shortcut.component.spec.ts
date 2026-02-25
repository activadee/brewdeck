import { TestBed } from '@angular/core/testing';

import { ZardMenuShortcutComponent } from './menu-shortcut.component';

describe('ZardMenuShortcutComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardMenuShortcutComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardMenuShortcutComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
