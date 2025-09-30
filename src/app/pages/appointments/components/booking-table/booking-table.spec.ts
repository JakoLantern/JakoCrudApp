import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingTable } from './booking-table';

describe('BookingTable', () => {
  let component: BookingTable;
  let fixture: ComponentFixture<BookingTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
