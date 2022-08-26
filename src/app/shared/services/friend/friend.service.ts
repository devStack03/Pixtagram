import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
// import  'rxjs/add/operator/map';
// tslint:disable-next-line:import-blacklist
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  uri = AppConfig.apiURL + 'friend/';
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(this.uri);
  }

  follow(id): Observable<any> {
    return this.http.post(this.uri + id + '/follow', {});
  }

  unfollow(id): Observable<any>  {
    return this.http.post(this.uri + id + '/unfollow', {});
  }


  followUser(following: string , fee: number): Observable<any> {
    return this.http.post(this.uri + 'follow', {following: following , fee: fee});
  }

  unfollowUser(following: string): Observable<any> {
    return this.http.post(this.uri + 'unfollow', {following: following});
  }

  isFollowed(following: string): Observable<any> {
    return this.http.get(this.uri + 'isFollowed/' + following);
  }
}
