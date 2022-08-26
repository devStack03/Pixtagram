import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed/feed.component';
import { ProfileComponent } from './profile/profile.component';
import { RoomComponent } from './message/room.component';
import { ComposeComponent } from './message/compose.component';
import { ChatComponent } from './message/chat.component';
import { AppMaterialModule } from '../../../app-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Router, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ContentModule } from '../../../layout/components/content/content.module';
import { PostComponent } from './post/post.component';
import { ViewPostComponent } from './post/view.component';
import { TermsComponent } from './terms/terms.component';
import { UnfollowDialogComponent } from './unfollow-dialog/unfollow-dialog.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import {DiscoverComponent} from './discover/discover.component';
import { ProfileFeedComponent } from './profile/tabs/feed/feed.component';
import { ProfilePostsComponent } from './profile/tabs/posts/posts.component';
import { ProfileBookmarksComponent } from './profile/tabs/bookmark/list.component';
import { ProfileLikesComponent } from './profile/tabs/like/like.component';
import { SearchComponent } from './search/search.component';

import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { BlockUIModule } from 'ng-block-ui';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxSocialShareModule } from 'ngx-social-share';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { LightboxModule } from 'ngx-lightbox';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { EmbededComponent } from './embeded/embeded.component';
import { ChatLeftSidenavComponent } from './message/chat-left-sidenav/chat-left-sidenav.component';
import { ChatChatsSidenavComponentComponent } from './message/sidenavs/left/chats/chat-chats-sidenav-component/chat-chats-sidenav-component.component';
import { ChatUserSidenavComponentComponent } from './message/sidenavs/left/user/chat-user-sidenav-component/chat-user-sidenav-component.component';
import {MatRadioModule} from '@angular/material/radio';
import { NotificationListComponent } from './notification-list-component/notification-list-component.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { BugReportComponent } from './bug-report/bug-report.component';
import { ReportDialogComponent } from './report-dialog/report-dialog.component';
import {PostFormDialogCompent} from './discover/post-form/post-form.component';
import { OauthComponent } from './oauth/oauth/oauth.component';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import { ConfirmMessageComponent } from './confirm-message/confirm-message.component';
import {SettingsComponent} from './settings/settings.component';
import { FollowingComponent } from './following/following.component';
import { TransactionComponent } from './transaction/transaction.component';
import {MatCardModule} from '@angular/material/card';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";

@NgModule({
    imports: [
        FuseModule,
        FuseSharedModule,
        FuseProgressBarModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        CommonModule,
        AppMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        FlexLayoutModule,
        RouterModule,
        ContentModule,
        SharedModule,
        LightboxModule,
        ImageCropperModule,
        NgxSocialShareModule,
        SocialLoginModule,
        BlockUIModule.forRoot(),
        InfiniteScrollModule,
        MatRadioModule,
        PickerModule,
        LazyLoadImageModule,
        MatCardModule,
        NgxDatatableModule
    ],
  declarations: [
    FeedComponent,
    ProfileComponent,
    TermsComponent,
    UnfollowDialogComponent,
    ShareDialogComponent,
    ProfilePostsComponent,
    ProfileFeedComponent,
    ProfileBookmarksComponent,
    ProfileLikesComponent,
    SearchComponent,
    ViewPostComponent,
    PostComponent,
    ComposeComponent,
    RoomComponent,
    ChatComponent,
    EmbededComponent,
    ChatLeftSidenavComponent,
    ChatChatsSidenavComponentComponent,
    ChatUserSidenavComponentComponent,
    NotificationListComponent,
    BugReportComponent,
    ReportDialogComponent,
    DiscoverComponent,
    PostFormDialogCompent,
    OauthComponent,
    ConfirmMessageComponent,
    SettingsComponent,
    FollowingComponent,
    TransactionComponent,

  ],
  entryComponents: [
    // PostFormDialogCompent,
    UnfollowDialogComponent,
    ShareDialogComponent,
    PostFormDialogCompent
  ]
})
export class HomeModule { }
