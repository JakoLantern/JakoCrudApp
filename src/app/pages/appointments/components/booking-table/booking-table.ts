import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

interface Appointment {
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'booking-table',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './booking-table.html',
  styleUrl: './booking-table.scss'
})
export class BookingTable implements AfterViewInit {
  displayedColumns: string[] = ['date', 'time', 'status', 'actions'];
  dataSource = new MatTableDataSource<Appointment>([
    { date: '2025-09-30', time: '10:00 AM', status: 'Confirmed' },
    { date: '2025-10-01', time: '2:00 PM', status: 'Pending' },
    { date: '2025-10-02', time: '11:00 AM', status: 'Confirmed' },
    { date: '2025-10-03', time: '4:00 PM', status: 'Cancelled' },
    // Add more data as needed
  ]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
