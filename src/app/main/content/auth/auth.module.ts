import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { CookieModule } from 'ngx-cookie';
import { Routes, RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { AppMaterialModule } from '../../../app-material-module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { AppConfig } from '../../../shared/config';
import {NotificationComponent} from './notification/notification.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {BlockUIModule} from 'ng-block-ui';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        CookieModule.forRoot(),
        RouterModule,
        AppMaterialModule,
        FuseSharedModule,
        SocialLoginModule,
        MatSnackBarModule,
        BlockUIModule,
    ],
  declarations: [LoginComponent, SignupComponent, ForgotPasswordComponent, NotificationComponent],
  providers: [ 
    {
        provide: 'SocialAuthServiceConfig',
        useValue: {
            autoLogin: false,
            providers: [
            {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(
                    AppConfig.Google_ID
                )
            },
            {
                id: FacebookLoginProvider.PROVIDER_ID,
                provider: new FacebookLoginProvider(AppConfig.Facebook_ID)
            }
            ]
        } as SocialAuthServiceConfig,
    }
]
})
export class AuthModule 
{
}
