import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = AppConfig.apiURL + 'user/';

  public notificationUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public followList: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public balance: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  public sfw: BehaviorSubject<string> = new BehaviorSubject<string>('N');
    // tslint:disable-next-line:typedef
  public setNotificationUpdated(bool) {
    this.notificationUpdated.next(bool);
  }

  constructor(private http: HttpClient) { }

    // tslint:disable-next-line:typedef
  getAll() {
    return this.http.get<User[]>(this.uri);
  }

  getById(id: any): Observable<any> {
    return this.http.get(this.uri + 'profile/' + id);
  }

  getBalanceAndKudo(): Observable<any> {
    return this.http.get(this.uri + 'getBalanceAndKudo');
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

  getBalanceFromNN(): Observable<any> {
     return this.http.post(this.uri + 'getBalanceFromNN', {});
  }

  transferBalance(owner, postId, postFee): Observable<any> {
      return this.http.post(this.uri + 'transferBalance', {owner: owner, postId: postId, postFee: postFee});
  }

  getLeaderboardOverall(): Observable<any> {
    return this.http.get(this.uri + 'getLeaderboardOverall');
  }

  getLeaderboardData(section: string): Observable<any> {
    return this.http.get(this.uri + 'getLeaderboardData/' + section);
  }

  followUser(following: string): Observable<any> {
    return this.http.post(this.uri + 'follow', {following: following});
  }

  unfollowUser(following: string): Observable<any> {
    return this.http.post(this.uri + 'unfollow', {following: following});
  }

  isFollowed(following: string): Observable<any> {
    return this.http.get(this.uri + 'isFollowed/' + following);
  }

  getFollowers(): Observable<any> {
      return this.http.get(this.uri + 'followers/');
  }

  getFollowings(): Observable<any> {
      return this.http.get(this.uri + 'followings/');
  }

  getFollow(start = 0, perPage = 0, followType = 1, username = ''): Observable<any> {
      return this.http.post(this.uri + 'followings/', {start: start, perPage: perPage, followType: followType, username: username});
  }

  updateEmail(newEmail: string): Observable<any> {
    return this.http.post(this.uri + 'updateEmail', {newEmail: newEmail});
  }
  updateSettings(country: string, notificationPush: boolean, notificationEmail: boolean): Observable<any> {
    return this.http.post(this.uri + 'updateSettings', {country: country, notification: {push: notificationPush, email: notificationEmail}});
  }

    // tslint:disable-next-line:typedef
  getTrans(param = {}){
      return this.http.post(this.uri + 'getTransaction', param);
  }

  deleteTransaction(param = {}){
      return this.http.post(this.uri + 'deleteTransaction', param);
  }
}
