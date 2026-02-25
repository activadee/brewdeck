import { TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';

describe('ContentComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ContentComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContentComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
