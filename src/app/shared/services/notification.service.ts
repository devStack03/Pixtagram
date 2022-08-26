import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  uri = AppConfig.apiURL + 'notification/';
  constructor(private http: HttpClient) { }

  get(start: Number, count: Number, isNew: any): Observable<any> {
    return this.http.get(this.uri + start + '/' + count + '/' + (isNew ? 'new' : 'all'));
  }

  delete(id: any) {
    return this.http.delete(this.uri + id);
  }
}
