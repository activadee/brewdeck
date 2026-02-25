import { TestBed } from '@angular/core/testing';

import { CommandPaletteComponent } from './command-palette.component';

describe('CommandPaletteComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPaletteComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CommandPaletteComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
