import { Injectable } from '@angular/core';
import { Configuration } from 'src/app/app.constants';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Record, Records } from '../models/records';
import { CounterCategory } from '../models/counterCategory';

@Injectable()
export class DataService {

  private actionUrl: String;

  constructor(private http: HttpClient, private _configuration: Configuration) {
    this.actionUrl = `${_configuration.ServerWithApi}recordController/`;
  }

  public getAll(): Observable<Records> {
    const finalUrl = `${this.actionUrl}getAllRecords`;
    return this.http.get<Records>(finalUrl);
  }

  public getSingle(category: String, subCategory: String): Observable<Record> {
    const finalUrl =
      `${this.actionUrl}getRecordsByParametersWithCount?categoryA=${category}&categoryB=${subCategory}`;
    console.log(finalUrl);

    return this.http.post<Record>(finalUrl, null);
  }


  public getSummaryCount(): Observable<CounterCategory> {
    const finalUrl =
      `${this.actionUrl}getSummaryCount`;
    console.log(finalUrl);

    return this.http.post<CounterCategory>(finalUrl, null);
  }
}


