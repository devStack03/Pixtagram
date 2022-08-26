import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { map } from 'rxjs/operators';
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
import { Post } from 'app/shared/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  uri = AppConfig.apiURL + 'post/';
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Post[]>(this.uri).pipe(map(res => res['data']));
  }

  getById(id: string) {
    return this.http.get(this.uri + id);
  }

  getByeEmbededId(id: string) {
    return this.http.get(this.uri + 'embeded/' + id);
  }

  update(id, post: Post) {
    return this.http.put(this.uri + id, post);
  }

  delete(id: string) {
    return this.http.delete(this.uri + id);
  }

  create(post): Observable<any> {
    return this.http.post(this.uri, post);
  }

  bookmark(post): Observable<any> {
    return this.http.post(this.uri + '/bookmark-feed', { post: post._id });
  }

  getPopulates(loaded: number, search: string): Observable<any> {
    return this.http.post(this.uri + 'populate' ,  {loaded: loaded, search: search});
  }

  // getPopulateMove(postId: string, direction: number, search: string) : Observable<any>{
  //    return this.http.post(this.uri + 'populate_move',   {postId:postId, direction: direction, search: search});
  // }

  // getPopulateAndSort(search: string, sortby: string, filterObj: any, start: number, count: number): Observable<any> {
  //   return this.http.post(this.uri + 'populateAndSort' ,  {search: search, sortby: sortby, filterObj: filterObj, start: start, count: count});
  // }

  getPopulatesByUser(userId: string, sortby: string, start: number, count: number): Observable<any> {
    return this.http.post(this.uri + 'populateByUser' ,  {userId: userId, sortby: sortby, start: start, count: count});
  }

  getAllwithScroll(start: number, count: number): Observable<any> {
    return this.http.post(this.uri + 'getAll' ,  {start: start, count: count});
  }

  // getTagCandidates(searchTerm: string): Observable<any> {
  //   return this.http.get(this.uri + 'getTagCandidates/' + searchTerm);
  // }
}
