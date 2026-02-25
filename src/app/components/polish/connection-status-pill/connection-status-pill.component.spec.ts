import { TestBed } from '@angular/core/testing';

import { ConnectionStatusPillComponent } from './connection-status-pill.component';

describe('ConnectionStatusPillComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionStatusPillComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConnectionStatusPillComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
