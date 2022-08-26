import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
// import  'rxjs/add/operator/map';
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
import { Like } from '../../models/like.model';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  uri = AppConfig.apiURL + 'like/';
  constructor(private http: HttpClient) { }

    // tslint:disable-next-line:typedef
  getAll() {
    return this.http.get<Like[]>(this.uri);
  }

    // tslint:disable-next-line:typedef
  getById(id: string) {
    return this.http.get(this.uri + id);
  }

    // tslint:disable-next-line:typedef
  update(post: Like) {
    return this.http.put(this.uri + post.id, post);
  }

    // tslint:disable-next-line:typedef
  delete(id: string) {
    return this.http.delete(this.uri + id);
  }

  create(post): Observable<any> {
    return this.http.post(this.uri, { post: post._id });
  }

  createComment(comment): Observable<any> {
    return this.http.post(this.uri, { post: comment.post, comment: comment._id, commenter: comment?.commenter?._id, ctype: comment?.ctype });
  }

    // tslint:disable-next-line:typedef
  countByUser(userId: string) {
    return this.http.get(this.uri + 'countByUser/' + userId);
  }

  getByUserAndSort(userId: string, sortby: string, start: number, count: number): Observable<any> {
    return this.http.post(this.uri + 'getByUser',  {userId: userId, sortby: sortby, start: start, count: count});
  }
}
