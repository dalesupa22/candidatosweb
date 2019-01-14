import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Records } from 'src/app/shared/models/records';
import { DataService } from 'src/app/shared/services/dataservice';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  public data: Records;
  public message: String;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getAll()
      .subscribe((data: Records) => {
        this.data = data;
      }, error => () => {
        console.log('Ocurrió un error al traer los datos', error);
      }, () => {
        console.log('Se obtienen los datos');
      });
  }

  public redirect(event) {
    this.router.navigate(['']);
  }

}
