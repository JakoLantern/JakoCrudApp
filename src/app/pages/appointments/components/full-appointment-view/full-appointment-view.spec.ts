import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullAppointmentView } from './full-appointment-view';

describe('FullAppointmentView', () => {
  let component: FullAppointmentView;
  let fixture: ComponentFixture<FullAppointmentView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullAppointmentView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullAppointmentView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
