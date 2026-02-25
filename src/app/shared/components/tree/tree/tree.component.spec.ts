import { TestBed } from '@angular/core/testing';

import { ZardTreeComponent } from './tree.component';

describe('ZardTreeComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardTreeComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardTreeComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
