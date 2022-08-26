import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
// import  'rxjs/add/operator/map';
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
import { Bookmark } from '../../models/bookmark.model';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  uri = AppConfig.apiURL + 'bookmark/';
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Bookmark[]>(this.uri);
  }

  getById(id: string) {
    return this.http.get(this.uri + id);
  }

  update(post: Bookmark) {
    return this.http.put(this.uri + post.id, post);
  }

  delete(id: string) {
    return this.http.delete(this.uri + id);
  }

  create(post): Observable<any> {
    return this.http.post(this.uri, { post: post._id });
  }

  getByUser(userId: string) {
    return this.http.get(this.uri + 'getByUser/' + userId);
  }
}
