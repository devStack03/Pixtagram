import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert/alert.service';
import { UserService } from '../../../../shared/services/user/user.service';
import { AppConstants } from '../../../../shared/constants';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: fuseAnimations
})
export class NotificationComponent implements OnInit {

  loginForm: FormGroup;
  loginFormErrors: any;

  private loggedIn: boolean;
  submitted = false;
  loading = false;
  errorOccurred = false;
  error = 'Unknown Error';
  returnUrl: string;

  user: any;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,    
    private userAuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _cookieService: CookieService,
    private socialAuthService: SocialAuthService,
    private alertService: AlertService,
    private userService: UserService
  ) {
    this.fuseConfig.setConfig({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.loginFormErrors = {
      email: {},
      password: {}
    };
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('notification user status');
    console.log(this.user);
    if (this.user.showNotification)
      this.router.navigate(['/']);
  }

  

  /**
   * Submit
   */
  onTurnOn(flag) {
    
    if (!flag) {
      this.router.navigate(['/']);
      return;
    }

    this.submitted = true;
    this.loading = true;
    this.errorOccurred = false;

    var params = Object();
    params['id'] = this.user.id;
    params['showNotification'] = true;

    this.userService.update(params).subscribe((data) => {
      this.submitted = false;
      this.loading = false;
      this.user.showNotification = true;

      localStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));

      this.router.navigate(['/']);

    });
  }

  



  
}
