import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import { ChatService } from 'app/main/content/home/chat/chat.service';
import {AppConstants} from "../../../../shared/constants";

// @ts-ignore
@Component({
    selector     : 'chat',
    templateUrl  : './chat.component.html',
    styleUrls    : ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class Chat1Component implements OnInit, OnDestroy
{
    selectedChat: any;
    rname: string;
    cuser: any;
    roomName: BehaviorSubject<string>;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.cuser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        this._chatService.onChatSelected
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(chatData => {
            this.selectedChat = chatData;
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    displayChatLabel(individualRoom) {
        let result = '';
        let index = 0;

        let me_excepting = individualRoom.filter(c => {
            if (c._id !== this.cuser.id){
                return c;
            }
        });
        if (me_excepting.length !== individualRoom.length) {
            me_excepting.unshift({username: this.selectedChat.creator_name});
        }
        me_excepting = me_excepting.slice(0, 3);
        for (const r of me_excepting) {
            if (index === 0) {
                result = r.username;
            }
            else{
                if (index === 1){
                    result += ' and ';
                }
                if (index > 1) {
                    result += ',';
                }
                result += r.username;
            }
            index ++;
        }
        return result;
    }
}
