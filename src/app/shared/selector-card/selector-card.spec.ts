import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorCard } from './selector-card';

describe('SelectorCard', () => {
  let component: SelectorCard;
  let fixture: ComponentFixture<SelectorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
