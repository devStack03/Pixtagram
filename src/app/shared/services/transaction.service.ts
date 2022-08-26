import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Kudo } from '../models/kudo.model';
import { AppConfig } from '../config';
import { AppConstants } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  uri = AppConfig.apiURL + 'transaction/';
  constructor(private http: HttpClient) { }

  // getAll() {
  //   return this.http.get<Kudo[]>(this.uri);
  // }

  getBySender(userId: any): Observable<any> {
    return this.http.get(this.uri + 'sender/' + userId);
  }

  getByReceiver(userId: any): Observable<any> {
    return this.http.get(this.uri + 'receiver/' + userId);
  }

  getBySenderAndReceiver(sortby: string, searchTerm: string): Observable<any> {
    return this.http.get(this.uri + 'getBySenderAndReceiver/' + sortby + '/' + searchTerm);
  }

  send(receiver: any, amount: any, type: any) {
    return this.http.post(this.uri, {receiver: receiver, amount : amount, type: type});
  }

  delete(id: any) {
    return this.http.delete(this.uri + id);
  }

  getBalance(): Observable<any> {
    return this.http.get(this.uri + 'getBalance');
  }
}
