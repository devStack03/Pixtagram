import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class KudoService {
  uri = AppConfig.apiURL + 'kudo/';
  constructor(private http: HttpClient) { }

  // getAll() {
  //   return this.http.get<Kudo[]>(this.uri);
  // }

  getBySender(userId: any): Observable<any> {
    return this.http.get(this.uri + 'sender/' + userId);
  }

  getByReceiver(sortby: string): Observable<any> {
    return this.http.get(this.uri + 'receiver/' + sortby);
  }

  countByReceiver(userId: any): Observable<any> {
    return this.http.get(this.uri + 'countByReceiver/' + userId);
  }

  sendKudo(receiver: any, position: any, post: string): Observable<any> {
    return this.http.post(this.uri, {receiver: receiver, position: position, post: post});
  }

  isKudoSent(receiver: string): Observable<any> {
    return this.http.get(this.uri + 'isKudoSent/' + receiver);
  }

  delete(id: any) {
    return this.http.delete(this.uri + id);
  }
}
