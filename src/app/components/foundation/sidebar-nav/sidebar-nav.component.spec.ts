import { TestBed } from '@angular/core/testing';

import { SidebarNavComponent } from './sidebar-nav.component';

describe('SidebarNavComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarNavComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
