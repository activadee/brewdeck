import { TestBed } from '@angular/core/testing';

import { ZardAccordionItemComponent } from './accordion-item.component';

describe('ZardAccordionItemComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardAccordionItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardAccordionItemComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
