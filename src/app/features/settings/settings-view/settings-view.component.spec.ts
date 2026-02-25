import { TestBed } from '@angular/core/testing';

import { SettingsViewComponent } from './settings-view.component';

describe('SettingsViewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsViewComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SettingsViewComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
