import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
import {Observable} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  uri = AppConfig.apiURL + 'report/';
  constructor(private http: HttpClient) { }
  create(post): Observable<any> {
      return this.http.post(this.uri, post);
  }

  getReports(params = {}): Observable<any>{
     return this.http.post(this.uri + 'getReports', params);
  }
}
