import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {first, takeUntil} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { AlertService } from '../../../../shared/services/alert/alert.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as NN from '../../../../../../loginNN/loginwithz.min.js';
import {nnNetwork} from '../../../../shared/constants';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ToastrService } from 'ngx-toastr';
import {Subject} from 'rxjs';
import {UserService} from '../../../../shared/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: fuseAnimations
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  loginFormErrors: any;
    // tslint:disable-next-line:variable-name
  private l_time = null;
  private user: SocialUser;
  private loggedIn: boolean;
  submitted = false;
  loading = false;
  errorOccurred = false;
  error = 'Unknown Error';
  returnUrl: string;
  private _unsubscribeAll: Subject<any>;
  @BlockUI() blockUI: NgBlockUI;
  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,    
    private userAuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _cookieService: CookieService,
    private socialAuthService: SocialAuthService,
    private _matSnackBar: MatSnackBar,
    private alertService: AlertService,
    private toastrService: ToastrService,
    private userService: UserService
  ) {
      this.userAuthService.logout();
      this._unsubscribeAll = new Subject();
      localStorage.setItem('state', this.randomString(40, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
      localStorage.setItem('verifier', this.randomString(50, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
      this.fuseConfig.setConfig({
          layout: {
            navigation: {hidden : true},
            toolbar: {hidden : true},
            footer: {hidden : true}
          }
       });

      this.loginFormErrors = {
          email: {},
          password: {}
      };
  }

    // tslint:disable-next-line:typedef
  showNotification(msg, msg1= '') {
      // tslint:disable-next-line:variable-name
      let cur_msg = '<p>' + msg + '</p>';
      if (msg1.trim() !== ''){
          cur_msg += '<p>' + msg1 + '</p>';
      }
      this.toastrService.error(cur_msg, '', {
          progressBar: false,
          timeOut: 60000,
          enableHtml: true,
          positionClass: 'toast-top-center',
          disableTimeOut: true
      });
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberCheckbox: ['']
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      // tslint:disable-next-line:variable-name
    const this_object = this;
    this.l_time = setTimeout(() => {
          NN.loginwithz.init({
              verifier: localStorage.getItem('verifier'),
              buttonId: 'loginwithz',
              clientId: nnNetwork.clientId,
              scope: 'profile credit',
              state: localStorage.getItem('state'),
              siteUrl: 'www.newbienudes.com',
              // tslint:disable-next-line:only-arrow-functions typedef
              handler: function(state, code, codeVerifier) {
                  if (localStorage.getItem('state') != null &&  localStorage.getItem('state') === state && code != null){
                      // tslint:disable-next-line:one-variable-per-declaration
                      let atoken = 0;
                      let rtoken = 0;

                      if (!this_object.userAuthService.getCookie('nn_access')) {
                          atoken = 1;
                      }

                      if (!this_object.userAuthService.getCookie('nn_refresh')) {
                          rtoken = 1;
                      }

                      this_object.blockUI.start('Loading...');

                      this_object.userAuthService.processLogin({
                          code: code,
                          code_verifier: codeVerifier,
                          accessToken: this_object.userAuthService.getCookie('nn_access') ? JSON.parse(this_object.userAuthService.getCookie('nn_access')).data : '',
                          refreshToken: this_object.userAuthService.getCookie('nn_refresh') ? JSON.parse(this_object.userAuthService.getCookie('nn_refresh')).data : '',
                          atoken: atoken,
                          rtoken: rtoken
                      }).pipe(takeUntil(this_object._unsubscribeAll)).subscribe((data) => {
                          this_object.blockUI.stop();
                          this_object.loading = false;
                          this_object.userAuthService.setLoggedIn(true);
                          if (data.success && data.success > 0) {
                              // tslint:disable-next-line:variable-name
                              const credit_balance = data.user ? data.user.credit_balance : 0;
                              // this_object.userService.balance.next(credit_balance);
                              this_object.router.navigate(['/']);
                          } else {
                              if (data.error === 'premium')
                              {
                                  this_object.showNotification('You need to be premium to login to newbiefans', '');
                              }
                              else{
                                  this_object.showNotification(data.error);
                              }
                          }
                      }, (error) => {
                          this_object.blockUI.stop();
                          this_object.loading = false;
                          if (error instanceof HttpErrorResponse) {
                              this_object.showNotification( error.error.error);
                          } else {
                              this_object.showNotification( error);
                          }
                      });
                  }
                  else{
                      this_object.showNotification('Error Occured');
                  }
              }
          });
      }, 1000);

  }

    // tslint:disable-next-line:typedef
  ngOnDestroy(){
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
      this.toastrService.clear();
  }

    // tslint:disable-next-line:typedef use-lifecycle-interface
  ngAfterViewInit(){
      // tslint:disable-next-line:variable-name

  }

    // tslint:disable-next-line:typedef use-lifecycle-interface


    // tslint:disable-next-line:typedef
  onLoginFormValuesChanged() {
    for (const field in this.loginFormErrors) {
      if (!this.loginFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.loginFormErrors[field] = {};

      // Get the control
      const control = this.loginForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.loginFormErrors[field] = control.errors;
      }
    }
  }

  // convenience getter for easy access to form fields
    // tslint:disable-next-line:typedef
  get f() { return this.loginForm.controls; }

  /**
   * Submit
   */
  // tslint:disable-next-line:typedef
  onSubmit() {
      this.submitted = true;
      this.loading = true;
      this.errorOccurred = false;
      this.error = 'Unknown Error';
      this.blockUI.start('Loading...');
      this.userAuthService.signIn(this.f.email.value, this.f.password.value, this.f.rememberCheckbox.value).pipe(first()).subscribe((data) => {
          this.blockUI.stop();
          this.loading = false;
          this.userAuthService.setLoggedIn(true);
          if (data.success && data.success > 0) {
              this.router.navigate(['/']);
          } else {
            this.showNotification(data.error);
          }
        }, (error) => {
          this.blockUI.stop();
          this.loading = false;
          if (error instanceof HttpErrorResponse) {
            this.showNotification( error.error.error);
          } else {
            this.showNotification( error);
          }
      });
  }


    // tslint:disable-next-line:typedef
  onClickLoginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      this.submitted = true;
      this.loading = true;
      this.blockUI.start('Loading...');
      this.userAuthService.loginWithGoogle(data).pipe(first()).subscribe((user) => {
        this.blockUI.stop();
        this.loading = false;
        this.userAuthService.setLoggedIn(true);
        this.router.navigate(['/']);
      }, (error) => {
        this.blockUI.stop();
        this.loading = false;
        this.alertService.error(error);
      });
    }, error => {
      console.log(error);
    });
  }
    // tslint:disable-next-line:typedef
   randomString(length, chars) {
      let result = '';
      for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)]; }
      return result;
   }

}
