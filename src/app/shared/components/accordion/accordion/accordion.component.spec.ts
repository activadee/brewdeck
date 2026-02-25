import { TestBed } from '@angular/core/testing';

import { ZardAccordionComponent } from './accordion.component';

describe('ZardAccordionComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAccordionComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAccordionComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
