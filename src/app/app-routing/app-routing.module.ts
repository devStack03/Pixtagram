import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../main/content/auth/login/login.component';
import { NotificationComponent } from '../main/content/auth/notification/notification.component';
import { SignupComponent } from '../main/content/auth/signup/signup.component';
import { ForgotPasswordComponent } from '../main/content/auth/forgot-password/forgot-password.component';
import { FeedComponent } from '../main/content/home/feed/feed.component';
import { ProfileComponent } from '../main/content/home/profile/profile.component';
import { SearchComponent } from '../main/content/home/search/search.component';
import { AuthGuard } from '../shared/guards/auth/auth.guard';
import { PostComponent } from '../main/content/home/post/post.component';
import { ViewPostComponent } from '../main/content/home/post/view.component';

import { ChatComponent } from '../main/content/home/message/chat.component';
import { ComposeComponent } from '../main/content/home/message/compose.component';
import {Chat1Component} from '../main/content/home/chat/chat.component';
import { TermsComponent } from '../main/content/home/terms/terms.component';
import {EmbededComponent} from '../main/content/home/embeded/embeded.component';
import {ChatService} from '../main/content/home/chat/chat.service';
import {NotificationListComponent} from '../main/content/home/notification-list-component/notification-list-component.component';
import {BugReportComponent} from '../main/content/home/bug-report/bug-report.component';
import {OauthComponent} from '../main/content/home/oauth/oauth/oauth.component';
import {SettingsComponent} from '../main/content/home/settings/settings.component';
import {TransactionComponent} from "../main/content/home/transaction/transaction.component";

const routers: Routes = [
  // { path: '**', redirectTo: '', pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent, data: { title: '' } },
  { path: 'notification', component: NotificationComponent, data: { title: '' } },
  { path: 'notification_list', component: NotificationListComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: '' } },
  { path: '', component: FeedComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'post', component: PostComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'view-post/:id', component: ViewPostComponent, data: { title: '' }},
  { path: 'post/:id', component: EmbededComponent, data: { title: '' }},
  { path: 'messages', component: Chat1Component, data: { title: '' }, canActivate: [AuthGuard], resolve: { chat: ChatService }, children: [] },
  { path: 'new-message', component: ComposeComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'chat/:id', component: ChatComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: 'terms', component: TermsComponent },
  { path: 'bug_report', component: BugReportComponent, data: {title: ''}, canActivate: [AuthGuard]},
  { path: 'settings', component: SettingsComponent, data: {title: ''}, canActivate: [AuthGuard]},
  { path: 'transaction', component: TransactionComponent, data: {title: ''}, canActivate: [AuthGuard]},
  { path: 'oauth/callback', component: OauthComponent },
  {
    path: 'accounts',
    loadChildren: '../main/content/home/accounts/accounts.module#AccountsModule'
  },
  { path: 'users/:id', component: ProfileComponent, data: { title: '' }, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routers),
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
