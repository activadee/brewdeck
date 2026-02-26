import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarNavComponent } from './sidebar-nav.component';

describe('SidebarNavComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarNavComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('includes services navigation entry', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarNavComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Services');
  });
});
