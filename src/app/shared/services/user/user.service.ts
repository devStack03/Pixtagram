import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = AppConfig.apiURL + 'user/';
  constructor(private http: HttpClient) { }

    // tslint:disable-next-line:typedef
  getAll() {
    return this.http.get<User[]>(this.uri);
  }

  getById(id: any): Observable<any> {
    return this.http.get(this.uri + 'profile/' + id);
  }

  getByUsername(username: string): Observable<any> {
    return this.http.get(this.uri + 'username/' + username);
  }

    // tslint:disable-next-line:typedef
  update(user: any) {
    return this.http.patch(this.uri +  user.id, user);
  }

    // tslint:disable-next-line:typedef
  delete(id: any) {
    return this.http.delete(this.uri + id);
  }

  updateChatByUserId(id): Observable<any> {
     return this.http.post(this.uri + '/updateChat', {uid: id});
  }

    // tslint:disable-next-line:typedef
  updatePassword(params: any) {
    return this.http.post(this.uri + '/change-password', params);
  }

    // tslint:disable-next-line:typedef
  removeAvatar(id) {
    return this.http.delete(this.uri + id + '/remove-avatar');
  }

    // tslint:disable-next-line:typedef
  updateAvatar(id, params) {
    return this.http.patch(this.uri + id + '/update-avatar', params);
  }

  getPoplarPeople(loaded: number): Observable<any> {
    return this.http.get(this.uri + 'popular/' + loaded);
  }

    // tslint:disable-next-line:variable-name
  getBySearchWithUsername(search: string, start: number, count: number, exited_users= []): Observable<any> {
    return this.http.post(this.uri + 'getBySearchWithUsername' ,  {search: search, start: start, count: count, excepting: exited_users});
  }
    // tslint:disable-next-line:typedef
  removeChat(chatInfo) {
    return this.http.post(AppConfig.apiURL + 'chat/removeChat', {roomId: chatInfo});
  }

   getRoomsBySearchText(start: number, count: number, searchText = ''): Observable<any> {
    return this.http.post(AppConfig.apiURL + 'chat/' + 'testChat', {start: start, count: count, searchText: searchText});
   }
}
