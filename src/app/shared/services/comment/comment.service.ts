import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
// import  'rxjs/add/operator/map';
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
import { Comment } from '../../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  uri = AppConfig.apiURL + 'comment/';
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Comment[]>(this.uri);
  }

  loadComments(postId: any, loaded: number) : Observable<any>  {
    return this.http.get(this.uri + 'load/' + loaded + '/' + postId);
  }

  getById(id: string) {
    return this.http.get(this.uri + id);
  }

  update(post: Comment) {
    return this.http.put(this.uri + post.id, post);
  }

  delete(id: string) {
    return this.http.delete(this.uri + id);
  }

  create(post, text: string): Observable<any> {
    const params = {
      post: post._id,
      text: text,
      owner: post.owner._id
    };
    return this.http.post(this.uri, params);
  }
}
