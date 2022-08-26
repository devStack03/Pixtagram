import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { fuseAnimations } from '@fuse/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { AlertService } from '../../../../shared/services/alert/alert.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import * as NN from '../../../../../../loginNN/loginwithz.min';
import {nnNetwork} from '../../../../shared/constants';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: fuseAnimations
})
export class SignupComponent implements OnInit {

  registerForm: FormGroup;
  registerFormErrors: any;
  loginErrors: any;

  submitted = false;
  loading = false;
  private user: SocialUser;
  private loggedIn: boolean;
  returnUrl: string;
  @BlockUI() blockUI: NgBlockUI;
  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private userAuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private socialAuthService: SocialAuthService,
    private _matSnackBar: MatSnackBar,
    private alertService: AlertService,
    private toastrService: ToastrService
  ) {
      localStorage.setItem('state', this.randomString(40, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
      localStorage.setItem('verifier', this.randomString(50, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
      this.fuseConfig.setConfig({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

      this.loginErrors = {
          email : 0,
          username: 0,
    };

      this.registerFormErrors = {
          name: {},
          email: {},
          password: {},
          // passwordConfirm: {},
          // termsCheckbox: {}
        };
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fullName: [''],     
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // passwordConfirm: ['', [Validators.required, confirmPassword]],
      // termsCheckbox: [false, Validators.required]
    });

    this.registerForm.valueChanges.subscribe(() => {
      this.onRegisterFormValuesChanged(); 
    });

    this.socialAuthService.authState.pipe(first()).subscribe((user) => {
      this.user = user;
      console.log(' user => ', user);
      this.loggedIn = (user != null);
    }, (error) => {
      console.log(error);
    });
  }

    // tslint:disable-next-line:typedef use-lifecycle-interface
    ngAfterViewInit(){
        // tslint:disable-next-line:variable-name
        const this_object = this;
        setTimeout(() => {
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
                        let atoken = 0;
                        let rtoken = 0;

                        if (!this_object.userAuthService.getCookie('nn_access')) {
                            atoken = 1;
                        }

                        if (!this_object.userAuthService.getCookie('nn_refresh')) {
                            rtoken = 1;
                        }
                        this_object.blockUI.start('Loading...');
                        this_object.userAuthService.processLogin(
                            {
                                code: code,
                                code_verifier: codeVerifier,
                                accessToken: this_object.userAuthService.getCookie('nn_access') ? JSON.parse(this_object.userAuthService.getCookie('nn_access')).data : '',
                                refreshToken: this_object.userAuthService.getCookie('nn_refresh') ? JSON.parse(this_object.userAuthService.getCookie('nn_refresh')).data : '',
                                atoken: atoken,
                                rtoken: rtoken
                            }).subscribe((data) => {
                            this_object.blockUI.stop();
                            this_object.loading = false;
                            this_object.userAuthService.setLoggedIn(true);
                            if (data.success && data.success > 0) {
                                this_object.router.navigate(['/']);
                            } else {
                                if (data.error === 'premium')
                                {
                                    this_object.showNotification('Only premium members have access to NewbieFans', 'please upgrade your account on NN to premium');
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
    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)]; }
        return result;
    }

    // tslint:disable-next-line:typedef
  onRegisterFormValuesChanged() {
    for (const field in this.registerFormErrors) {
      if (!this.registerFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.registerFormErrors[field] = {};

      // Get the control
      const control = this.registerForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.registerFormErrors[field] = control.errors;
      }
    }

    console.log('check', this.registerFormErrors);
  }

  // convenience getter for easy access to form fields
    // tslint:disable-next-line:typedef
  get f() { return this.registerForm.controls; }
  /**
   * 
   */
  // tslint:disable-next-line:typedef
  onSubmit() {
    this.blockUI.start('Loading...');
    this.submitted = true;
    this.loading = true;
    this.loginErrors = {
      email : 0,
      username: 0,
      other: 0,
    };
    this.userAuthService.signUp(this.f.email.value, this.f.password.value, this.f.name.value, this.f.fullName.value).pipe(first()).subscribe((res) => {
      this.blockUI.stop();
      if (!res.success) {
          // tslint:disable-next-line:triple-equals
        if ( res.error == 'Email exists' ) {
          this.showNotification('Your email is already registered.');
        } else if ( res.error === 'Username exists' ) {
          this.showNotification('Your username is already registered. Try another one.');
        } else {
          this.showNotification(res.error);
        }
        return;
      }
      this.loading = false;
      this.userAuthService.setLoggedIn(true);
      this.router.navigate(['/notification']);
    }, (error) => {
      this.blockUI.stop();
      this.loading = false;
      if (error instanceof HttpErrorResponse) {
        alert(error.error.error);
      } else {
        console.log(error);
      }
    });
  }

    // tslint:disable-next-line:typedef
  onClickLoginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      this.blockUI.start('Loading...');
      this.submitted = true;
      this.loading = true;
      this.userAuthService.loginWithGoogle(data).pipe(first()).subscribe((user) => {
        this.loading = false;
        this.blockUI.stop();
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

  // private
    // tslint:disable-next-line:typedef
  signOutSocialAccounts() {
    this.socialAuthService.signOut();
  }



    showNotification(msg, msg1= '') {
        let cur_msg = '<p>' + msg + '</p>';
        if (msg1.trim() !== ''){
            cur_msg += '<p>' + msg1 + '</p>';
        }
        this.toastrService.error(cur_msg, '', {
            progressBar: false,
            timeOut: 5000,
            enableHtml: true,
            positionClass: 'toast-top-center',
        });
    }

}

// tslint:disable-next-line:typedef
function confirmPassword(control: AbstractControl) {
  if (!control.parent || !control) {
    return;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if (!password || !passwordConfirm) {
    return;
  }

  if (passwordConfirm.value === '') {
    return;
  }

  if (password.value !== passwordConfirm.value) {
    return {
      passwordsNotMatch: true
    };
  }
}

