import { TestBed } from '@angular/core/testing';

import { KeyboardShortcutsHintComponent } from './keyboard-shortcuts-hint.component';

describe('KeyboardShortcutsHintComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutsHintComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(KeyboardShortcutsHintComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
