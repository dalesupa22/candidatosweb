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

  /**
   * Documentation https://howtodoinjava.com/typescript/maps/ 25/07/2019
   * https://ng2.codecraft.tv/es6-typescript/mapset/
   * https://2ality.com/2015/08/es6-map-json.html
   */

  public getCounterAllSubCategories(category: String): Observable<string> {
  const finalUrl =
    `${this.actionUrl}getCounterAllSubCategories?category=${category}`;
  console.log(finalUrl);

  return this.http.post<string>(finalUrl, null);
}
}


