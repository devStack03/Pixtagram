import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatService } from 'app/main/content/home/chat/chat.service';
import * as ChatService1 from '../../../../../../../shared/services/chat/chat.service';
import {MatDialog} from '@angular/material/dialog';
import {ComposeComponent} from '../../../../message/compose.component';
import {UserService} from '../../../../../../../shared/services/user/user.service';
import {SocketService} from '../../../../../../../shared/services/socket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'chat-contact-sidenav',
    templateUrl  : './contact.component.html',
    styleUrls    : ['./contact.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatContactSidenavComponent implements OnInit, OnDestroy
{
    contact: any;
    // tslint:disable-next-line:variable-name
    member_list = [];
    roomname = '';
    // tslint:disable-next-line:variable-name
    origin_name = '';

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService,
        private _matDialog: MatDialog,
        private chatService: ChatService1.ChatService,
        private userSerivce: UserService,
        private socketService: SocketService,
        private matSnackBar: MatSnackBar
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
        this._chatService.onContactSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(contact => {
                this.contact = contact;
                this.member_list = this.contact &&  this.contact.contact ? this.contact.contact.filter((item) => {
                        if (item._id !== this.contact.currentUserId){
                            return item;
                        }
                    }) : [];
                this.origin_name = this.roomname = this._chatService.chat_name.getValue() ? this._chatService.chat_name.getValue() : '';
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

    // tslint:disable-next-line:typedef
    addGroup() {
        if (!this.contact?.roomId) {
            return false;
        }
        this._chatService.updateRoom({id: this.contact.roomId, name: this.roomname}).subscribe((room) => {
            if (room['success'] === 1) {
                this._chatService.chat_name.next(this.roomname);
                this.origin_name = this.roomname;
                this.socketService.sendNotification({content: 'groupname', roomName: this.roomname, roomId: this.contact.roomId});
            }
        });
    }
    // tslint:disable-next-line:typedef
    onComposeChatClicked() {
        // this.router.navigate(['new-message']);
        const newMsg = this._matDialog.open(ComposeComponent, {
            width: '350px',
            height: '450px',
            data: {contact: this.contact.contact, roomId: this.contact?.roomId}
        });
        newMsg.afterClosed().subscribe((data) => {
            if (data && data.data && data.data.group) {
                this.member_list = data.data.group;
                this.contact.contact = data.data.group;
            }
        });
    }

    // tslint:disable-next-line:typedef
    controlRoom(type: string) {
        if (type === 'delete') {
            this.deleteChat(this.contact?.roomId, true);
        }
        else{
            this.removeGroup(this.contact?.currentUserId, true);
        }
    }

    // tslint:disable-next-line:typedef
    removeGroup(userId = '', reload = false) {
        if (!this.contact?.roomId || !userId) {
            return false;
        }
        this.chatService.createRoom({usrs: [], roomId: this.contact.roomId, remove: userId}).subscribe((data: any) => {
            if (data['success'] === 1 && data.data){
                this.socketService.sendNotification({content: 'room', data: data.data, remove: userId});
                if (reload) {
                    location.reload();
                }
                else{
                    this.member_list  = this.member_list.filter((item) => {
                        if (item._id !== userId) {
                            return item;
                        }
                    });
                    if (this.contact &&  this.contact.contact) {
                       this.contact.contact =  this.contact.contact.filter((item) => {
                           if (item._id !== userId) {
                               return item;
                           }
                       });
                    }
                }
            }
            if (data['success'] === 0 && data['error']) {
                this.matSnackBar.open(data['error'], '', {
                    verticalPosition: 'top',
                    horizontalPosition: 'right',
                    politeness : 'assertive',
                    duration : 3000
                });
            }
        });
    }
    // tslint:disable-next-line:typedef
    deleteChat(id: any, reload = false) {
        if (id.trim() === '' || id === 'new' ){
            return false;
        }
        else{
            this.userSerivce.removeChat(id).subscribe((data) => {
                this.socketService.sendNotification({content: 'removedRooom', roomId: id});
                if (reload) {
                    location.reload();
                }
            });
        }
    }
}
