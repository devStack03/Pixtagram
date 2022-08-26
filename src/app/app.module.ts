import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { fuseConfig } from 'app/fuse-config';
import { AuthGuard } from 'app/shared/guards/auth/auth.guard';
import { AlertService } from 'app/shared/services/alert/alert.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { AuthModule } from 'app/main/content/auth/auth.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { HomeModule } from './main/content/home/home.module';
import {NgxNotificationMsgModule} from 'ngx-notification-msg';
import { ToastrModule } from 'ngx-toastr';
import { AccountsModule } from './main/content/home/accounts/accounts.module';
import { MessagingService} from './messaging.service';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import {AppConfig} from './shared/config';
// tslint:disable-next-line:import-spacing
import { ChatModule }  from  './main/content/home/chat/chat.module';
import { SharedModule } from './shared/shared.module';
import { JwtInterceptor } from './shared/helpers/jwt.interceptor';
import { ErrorInterceptor } from './shared/helpers/error.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {NotificationService} from './shared/global';
import {SocketIoModule , SocketIoConfig} from 'ngx-socket-io';
const config: SocketIoConfig = {url: AppConfig.siteUrl + ':8282', options: { transports: ['websocket'], reconnection: true} };
initializeApp(environment.firebase);
@NgModule({
    declarations: [
        AppComponent,
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        AppRoutingModule,
        LayoutModule,
        AuthModule,
        HomeModule,
        ChatModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        NgxNotificationMsgModule,
        AccountsModule,
        SocketIoModule.forRoot(config),
        ToastrModule.forRoot(),
    ],
    bootstrap   : [
        AppComponent
    ],
    providers: [
        AuthGuard,
        AlertService,
        AuthService,
        NotificationService,
        MessagingService,
        // UserService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ]
})
export class AppModule
{
}




