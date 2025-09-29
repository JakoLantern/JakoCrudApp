import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSummary } from './appointment-summary';

describe('AppointmentSummary', () => {
  let component: AppointmentSummary;
  let fixture: ComponentFixture<AppointmentSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
