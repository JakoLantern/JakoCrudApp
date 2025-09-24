import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAppointment } from './view-appointment';

describe('ViewAppointment', () => {
  let component: ViewAppointment;
  let fixture: ComponentFixture<ViewAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAppointment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAppointment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
