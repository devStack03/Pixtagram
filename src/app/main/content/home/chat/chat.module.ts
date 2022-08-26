import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';

import { ChatService } from 'app/main/content/home/chat/chat.service';
import { Chat1Component } from 'app/main/content/home/chat/chat.component';
import { ChatStartComponent } from 'app/main/content/home/chat/chat-start/chat-start.component';
import { ChatViewComponent } from 'app/main/content/home/chat/chat-view/chat-view.component';
import { ChatChatsSidenavComponent } from 'app/main/content/home/chat/sidenavs/left/chats/chats.component';
import { ChatUserSidenavComponent } from 'app/main/content/home/chat/sidenavs/left/user/user.component';
import { ChatLeftSidenavComponent } from 'app/main/content/home/chat/sidenavs/left/left.component';
import { ChatRightSidenavComponent } from 'app/main/content/home/chat/sidenavs/right/right.component';
import { ChatContactSidenavComponent } from 'app/main/content/home/chat/sidenavs/right/contact/contact.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

const routes: Routes = [
    {
        path: 'msgs',
        component: Chat1Component,
        children: [],
        resolve: {
            chat: ChatService
        }
    }
];

@NgModule({
    declarations: [
        Chat1Component,
        ChatViewComponent,
        ChatStartComponent,
        ChatChatsSidenavComponent,
        ChatUserSidenavComponent,
        ChatLeftSidenavComponent,
        ChatRightSidenavComponent,
        ChatContactSidenavComponent
    ],
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,
        FuseSharedModule,
        PickerModule,
        RouterModule
    ],
    providers   : [
        ChatService
    ]
})
export class ChatModule
{
}
