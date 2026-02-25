import { TestBed } from '@angular/core/testing';

import { ZardLoaderComponent } from './loader.component';

describe('ZardLoaderComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ZardLoaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZardLoaderComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
