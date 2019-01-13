import { Injectable } from '@angular/core';
import { Configuration } from 'src/app/app.constants';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {

  private actionUrl: String;

  constructor(private http: HttpClient, private _configuration: Configuration) {
    this.actionUrl = `${_configuration.ServerWithApi}recordController/`;
  }

  public getAll<T>(): Observable<T> {
    const finalUrl = `${this.actionUrl}getAllRecords`;
    return this.http.get<T>(finalUrl);
  }

  public getSingle<T>(category: String, subCategory: String): Observable<T> {
    const finalUrl =
      `${this.actionUrl}getRecordsByParameter?categoryA=${category}&categoryB=${subCategory}`;

    return this.http.get<T>(finalUrl);
  }
}
