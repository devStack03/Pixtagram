
import {map, first} from 'rxjs/operators';
import { Injectable , EventEmitter} from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import {BehaviorSubject, Subject, Observable} from 'rxjs';
import { CookieService } from 'ngx-cookie';

// tslint:disable-next-line:import-blacklist
import 'rxjs/Rx';
import { AppConfig } from '../../config';
import {AppConstants, nnNetwork} from '../../constants';
import { Router, ActivatedRoute } from '@angular/router';
import {AlertService} from '../alert/alert.service';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class AuthService {
    private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    uri = 'auth';
    private token: string;

    // tslint:disable-next-line:typedef
    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    // tslint:disable-next-line:typedef
    public setLoggedIn(bool) {
        this.loggedIn.next(bool);
    }

    constructor(
        private http: HttpClient,
        private _cookieService: CookieService,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService
    )
    {
        const cookie = this.getCookie(AppConstants.currentUser);
        const sess = sessionStorage.getItem(AppConstants.currentUser);


        if (cookie)
        {
            const cookieObj = JSON.parse(cookie);
            if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
            {
                this.updateLocalStorage(cookieObj.user);
                this.loggedIn.next(true);
            }
        }
        else if (sess)
        {
            // tslint:disable-next-line:prefer-const
            let sessObj = JSON.parse(sess);
            if (sessObj && sessObj.username && sessObj.token && sessObj.user)
            {
                this.updateLocalStorage(sessObj.user);
                this.loggedIn.next(true);
            }
        }
    }

    // tslint:disable-next-line:typedef
    updateLocalStorage(user: any) {
        localStorage.setItem(AppConstants.currentUser, JSON.stringify(user));
    }

    public getCurrentUser(): string {

        const cookie = this.getCookie(AppConstants.currentUser);
        if (cookie)
        {
            const cookieObj = JSON.parse(cookie);
            console.log('cookieObj: ', cookieObj);
            if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
            {
                console.log('returned cookie obj', cookieObj);
                return cookie;
            }
        }
        else
        {
            const sess = sessionStorage.getItem(AppConstants.currentUser);
            if (sess)
            {

                const sessObj = JSON.parse(sess);
                console.log('sess: ', sessObj);

                if (sessObj && sessObj.username && sessObj.token && sessObj.user)
                {
                    console.log('returned sess obj', sessObj);
                    return sess;
                }
            }
            console.log('current user is null');
            return null;
        }
    }

    // tslint:disable-next-line:typedef
    public setCurrentUer(user: any) {
        const cookie = this.getCookie(AppConstants.currentUser);
        let shouldSend = false;
        if (cookie)
        {
            const cookieObj = JSON.parse(cookie);
            if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
            {
                cookieObj.user = user;
                cookieObj.user['token'] = cookieObj.token;

                this.updateLocalStorage(cookieObj.user);
                this.setCookie(AppConstants.currentUser, cookieObj);
                shouldSend = true;
            }
        }

        const sess = sessionStorage.getItem(AppConstants.currentUser);
        if (sess)
        {
            const sessObj = JSON.parse(sess);
            if (sessObj && sessObj.username && sessObj.token && sessObj.user)
            {
                sessObj.user = user;
                sessObj.user['token'] = sessObj.token;

                this.updateLocalStorage(sessObj.user);

                sessionStorage.setItem(AppConstants.currentUser, JSON.stringify(sessObj));
                shouldSend = true;
            }
        }

        if (shouldSend) {
            this.loggedIn.next(true);
        }
        location.reload();
    }

    /**
     * private
     */
    // tslint:disable-next-line:typedef
    getCookie(key: string){
        return this._cookieService.get(key);
    }

    // tslint:disable-next-line:typedef
    public setSfw(sfw = 'N'){
        this.setCookie('sfw', {sfw: sfw}, 30);
    }

    // tslint:disable-next-line:typedef
    public getSfw(){
        return this.getCookie('sfw');
    }

    // tslint:disable-next-line:typedef
    public setCookie(key: string, value: any, expirationDate = 1, second = false) {
        const expDate = new Date();
        // tslint:disable-next-line:variable-name
        let exp_date = expirationDate;
        if (second) {
            exp_date = expirationDate / 86400;
        }
        expDate.setDate(expDate.getDate() + exp_date);
        this._cookieService.putObject(key, value, {expires : expDate});
    }

    // tslint:disable-next-line:typedef
    private removeCookie(key: string) {
        this._cookieService.remove(key);
    }

    /**
     * public
     */

    // tslint:disable-next-line:typedef
    public signIn(email: string, password: string, isRemember?: boolean) {
        let params = {};
        const userflag = email.indexOf('@') < 0;
        if (userflag) {
            params = {
                username: email,
                password: password,
            };
        } else {
            params = {
                email: email,
                password: password,
            };
        }
        const url = AppConfig.apiURL + this.uri + '/login' + (userflag ? 'user' : '');
        return this.postData(url, params, 'login', isRemember);
    }

    // tslint:disable-next-line:typedef
    public signUp(email: string, password: string, username?: string, fullName?: string) {
        const params = {
            email: email,
            password: password,
            username: username
        };
        if (username && username.length > 0) {
            params['username'] = username;
        }
        if (fullName && fullName.length > 0) {
            params['fullName'] = fullName;
        }
        console.log('par => ', params);
        const url = AppConfig.apiURL + this.uri + '/register';
        return this.postData(url, params);
    }

    // tslint:disable-next-line:typedef
    public forgetPassword(email: string, password: string, username?: string) {
        const params = {
            email: email,
            password: password,
            username: username
        };
        if (username && username.length > 0) {
            params['username'] = username;
        }
        console.log('par => ', params);
        const url = AppConfig.apiURL + this.uri + '/forget-password';
        return this.postData(url, params);
    }


    /**
     * google sign in
     */
    // tslint:disable-next-line:typedef
    public loginWithGoogle(data: any) {
        if (data) {
            const params = {
                username: data.name ? data.name : data.email,
                email: data.email,
                firstName: data.firstName ? data.firstName : '',
                lastName: data.lastName ? data.lastName : '',
                socialId: data.id,
                type: 3,
                access_token: data.idToken,
                avatar: data.photoUrl
            };

            const url = AppConfig.apiURL + this.uri + '/login-social';
            return this.postData(url, params, 'login');

        }
    }

    // tslint:disable-next-line:typedef
    public loginWithFacebook(data: any) {
        if (data) {
            const params = {
                username: data.name ? data.name + this.randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') : data.email,
                email: data.email,
                firstName: data.firstName ? data.firstName : '',
                lastName: data.lastName ? data.lastName : '',
                socialId: data.id,
                type: 2,
                access_token: data.authToken,
                photoUrl: data.photoUrl
            };
            const url = AppConfig.apiURL + this.uri + '/login-social';
            return this.postData(url, params, 'login');
        }
    }

    // tslint:disable-next-line:typedef
    public logout() {
        this.loggedIn.next(false);
        // remove user from local storage to log user out
        this._cookieService.remove(AppConstants.currentUser);
        this._cookieService.remove('nn_access');
        this._cookieService.remove('nn_refresh');
        sessionStorage.removeItem(AppConstants.currentUser);
        localStorage.removeItem(AppConstants.currentUser);
    }

    // tslint:disable-next-line:typedef
    private postData(url, params, funcName?: string, isRemember?: boolean) {

        return this.http.post<any>(url, params).pipe(map(data => {
            if (data && data.success && data.success === 1)
            {
                if ( /*funcName === 'login' && */ data.user && data.user.token) {
                    // this.loggedIn.next(true);
                    // store user details and jwt token in the local storage to keep user logged in between page refreshes
                    if (isRemember) {
                        this.setCookie(AppConstants.currentUser, { username: data.user.username, token: data.user.token, user: data.user});
                    }
                    else {
                        this.removeCookie(AppConstants.currentUser);
                    }

                    sessionStorage.setItem(AppConstants.currentUser, JSON.stringify({ username: data.user.username, token: data.user.token, user: data.user}));
                    this.updateLocalStorage(data.user);
                    this.setLoggedIn(true);

                    if (data.nn_token && data.nn_token.token_create){
                        if (data.nn_token.accessToken) {
                            this.setCookie('nn_access', {data: data.nn_token.accessToken}, 3600, true);
                        }
                        if (data.nn_token.refreshToken && data.nn_token.expires_in > 0) {
                            this.setCookie('nn_refresh', {data: data.nn_token.refreshToken}, data.nn_token.expires_in, true);
                        }
                    }
                }
            }

            return data;
        }, err => {

        }));
    }


    processLogin(param = {}, payload = {}): Observable<any> {
        return this.postData(AppConfig.apiURL + this.uri + '/login-nn', param);
    }

    getUser(param = {}): Observable<any>{
        return this.http.get(nnNetwork.oauthUser, {headers: new HttpHeaders(param)});
    }

    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)]; }
        return result;
    }

    nnLogin(): Observable<any>{
        return new Observable((observer) => {
            observer.next(1);
        });
    }

}
