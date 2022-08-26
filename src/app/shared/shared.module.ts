import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserModule } from '@angular/platform-browser';
import { CookieModule } from 'ngx-cookie';

// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';

import { FuseSharedModule } from '@fuse/shared.module';

import { RouterModule } from '@angular/router';

import { SliceLinePipe } from './pipes/slice-line/slice-line.pipe';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
//import { TimeAgoPipe } from 'time-ago-pipe';
import { PostService } from 'app/shared/services/post/post.service';
import { ChatService } from 'app/shared/services/chat/chat.service';

@NgModule({
  imports: [
    CommonModule,
    // BrowserModule, 
    CookieModule.forRoot(),

      // MatButtonModule,
      // MatFormFieldModule,
      // MatIconModule,
      // MatInputModule,
      // MatSelectModule,

      FuseSharedModule,
      RouterModule
  ],

  providers: [
    PostService,
    ChatService,
  ],

  declarations: [
    SliceLinePipe,
    SafeHtmlPipe,
    //TimeAgoPipe,
    
  ],
  exports: [
    SliceLinePipe,
    SafeHtmlPipe,
    //TimeAgoPipe,
  ]
})
export class SharedModule { }
