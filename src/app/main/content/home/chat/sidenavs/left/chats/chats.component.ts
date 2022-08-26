import { Component, OnDestroy, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';
import { ChatService } from 'app/main/content/home/chat/chat.service';
import {UserService} from '../../../../../../../shared/services/user/user.service';
import {SocketService} from '../../../../../../../shared/services/socket.service';
import * as moment from 'moment';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import {NgxNotificationDirection, NgxNotificationMsgService, NgxNotificationStatusMsg} from 'ngx-notification-msg';
import {AppConstants} from '../../../../../../../shared/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as cha from '../../../../../../../shared/services/chat/chat.service';
import {MatDialog} from '@angular/material/dialog';
import {ComposeComponent} from '../../../../message/compose.component';

@Component({
    selector     : 'chat-chats-sidenav',
    templateUrl  : './chats.component.html',
    styleUrls    : ['./chats.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatChatsSidenavComponent implements OnInit, OnDestroy
{
    cuser: any;
    chats: any[];
    chatSearch: any;
    contacts: any[];
    searchText: string;
    user: any;
    selectedContact: any;
    rname: string;
    rimages: string[];
    private timer: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     * @param {FuseMatSidenavHelperService} _fuseMatSidenavHelperService
     * @param {MediaObserver} _mediaObserver
     */
    constructor(
        private _chatService: ChatService,
        private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
        public _mediaObserver: MediaObserver,
        private userService: UserService,
        private  socketService: SocketService,
        private router: Router,
        private readonly ngxNotificationMsgService: NgxNotificationMsgService,
        private _matSnackBar: MatSnackBar,
        private chatService: cha.ChatService,
        private _matDialog: MatDialog,
    )
    {
        // Set the defaults
        this.chatSearch = {
            name: ''
        };

        this.searchText = '';
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
        this.user = this._chatService.user;
        this.cuser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        // this.selectedContact = this._chatService.selectedContact;
        // if (!this.selectedContact && this.user?.chatList?.length) {
        //     this.getChat(this.user.chatList[0]);
        // }
        this.chats = this._chatService.chats;
        this.contacts = this._chatService.contacts;
        this._chatService.onChatsUpdated
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(updatedChats => {
                this.chats = updatedChats;
            });

        this._chatService.onUserUpdated
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(updatedUser => {
                this.user = updatedUser;
            });

        this.socketService.checkedRoom().pipe(takeUntil(this._unsubscribeAll)).subscribe((param) => {
            this.user.chatList = this.user.chatList.filter( (item) => {
                if (item.id !== param.room ) {
                    return item;
                }
            });
        });
        this.socketService.getMsg().pipe(takeUntil(this._unsubscribeAll)).subscribe((message) => {
            if (message) {
                if ((this.selectedContact && this.selectedContact.id !== message.room) ||
                    !this.selectedContact) {
                    this.addChatList(message);
                    this.ngxNotificationMsgService.open({
                        status: NgxNotificationStatusMsg.SUCCESS,
                        header: message.username,
                        messages: [message.message],
                        direction: NgxNotificationDirection.BOTTOM_RIGHT,
                        displayIcon: false,
                        color: '#039be5'
                    });
                }
            }
        });
        // this.socketService.getMessages().pipe(takeUntil(this._unsubscribeAll)).subscribe((message: any) => {
        //     const checkedContact = false;
        //
        // });

        this.socketService.getPush().pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
           if (response.content === 'groupname') {
               this.user.chatList = this.user.chatList.filter( (item) => {
                   if (item.id === response.roomId ) {
                       item.name = response.roomName;
                   }
                   return item;
               });
           }
           if (response.content === 'room') {

               if (response.code === 0 || !response.code) {
                   if (response.data.removed_flag) {
                       const belongsUser = response.data.group.filter((item) => {
                           if (item._id === this.cuser.id) {
                                return item;
                           }
                       });
                       const existedRoom = this.user.chatList.filter((item) => {
                           if (item.id === response.data.room_id) {
                               item.group = response.data.group;
                               return item;
                           }
                       });
                       if (existedRoom.length === 0 && belongsUser && response.data.room){
                           response.data.room.hasNewMsg = 0;
                           this.user.chatList.push(response.data.room);
                       }
                       if (this.selectedContact && this.selectedContact.id && this.selectedContact.id === response.data.room_id) {
                           this._chatService.updateContactFromChat(response.data.group);
                       }
                   }
                   else {
                       this.user.chatList = this.user.chatList.filter((item) => {
                           let checkdReturn = true;
                           if (item.id === response.data.room_id) {
                               item.group = response.data.group;
                               if (this.cuser.id !== response.data.room.participant1._id){
                                   const checkedUser = response.data.group.filter((items) => {
                                       if (items._id === this.cuser.id){
                                           return items;
                                       }
                                   });
                                   if (checkedUser.length === 0){
                                       checkdReturn = false;
                                   }
                               }
                           }
                           if (checkdReturn) {
                               return item;
                           }

                       });
                       if (this.selectedContact && this.selectedContact.id && this.selectedContact.id === response.data.room_id) {
                           this._chatService.updateContactFromChat(response.data.group);
                           if (response.remove && response.remove === this.cuser.id){
                               const matdeleted =  this._matSnackBar.open('You have been deleted by Room Manager.', null, {duration: 5000});
                               matdeleted.afterDismissed().subscribe(() => {
                                   location.reload();
                               });
                           }
                       }

                   }
               }

               else {
                   let createRoomCurrently = false;
                   if (this.cuser.id === response.data.room.participant1._id){
                       createRoomCurrently = true;
                   }
                   else{
                       const checkedRoom = response.data.room.group.filter((item) => {
                           if (item._id === this.cuser.id) {
                               return item;
                           }
                       });
                       if (checkedRoom && checkedRoom.length > 0) {
                           createRoomCurrently  = true;
                       }
                   }
                   if (createRoomCurrently) {
                       response.data.room.hasNewMsg = 0;
                       this.user.chatList.push(response.data.room);
                   }
               }
           }
           if (response.content === 'removedRooom') {
               // tslint:disable-next-line:variable-name
               let new_chats = [];
               new_chats = this.user.chatList.filter( (item) => {
                  if (item.id !== response.roomId) {
                      return item;
                  }
               });
               if (new_chats.length !== this.user.chatList.length && this.selectedContact && this.selectedContact.id === response.roomId) {
                   this._matSnackBar.open('The room has been deleted by manager');
                   location.reload();
               }
           }
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



    // tslint:disable-next-line:typedef use-lifecycle-interface
    ngAfterViewInit() {

        if (!this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav')._opened){
            this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get chat
     *
     * @param contact
     */
    getChat(contact): void
    {
        this.selectedContact = contact;
        this.user.chatList = this.user.chatList.filter((item) => {
            if (item && contact){
                if (item.id === contact.id){
                    const remainChat = this.chatService.chatNumber.getValue() - item.hasNewMsg;
                    item.hasNewMsg = 0;
                    this.chatService.setChatNumber(remainChat < 0 ? 0 : remainChat);
                    item.selectedClass = 'primary-50-bg';
                }
                else{
                    item.selectedClass = '';
                }
            }

            return item;
        });

        this._chatService.getChat(contact);

        if ( !this._mediaObserver.isActive('gt-md') )
        {
            this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
        }
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void
    {
        this._chatService.setUserStatus(status);
    }

    /**
     * Change left sidenav view
     *
     * @param view
     */
    changeLeftSidenavView(view): void
    {
        this._chatService.onLeftSidenavViewChanged.next(view);
    }

    /**
     * Logout
     */
    logout(): void
    {
        console.log('logout triggered');
    }

    // tslint:disable-next-line:typedef
    formatFromNow(value) {
        return moment(value).fromNow();
    }


    // tslint:disable-next-line:typedef
    deleteChat(id: any) {
        if (id.trim() === '' || id === 'new' ){
            this._matSnackBar.open('The room isn\'\t exist', '', {
                verticalPosition: 'bottom',
                horizontalPosition: 'right',
                politeness : 'assertive',
                duration        : 3000,

            });
        }
        else{
            this.userService.removeChat(id).subscribe((data) => {
                this.socketService.removeRoom(id);
                this.user.chatList = this.user.chatList.filter( (item) => {
                    if (!item.joined_room || item.joined_room._id !== id ) {
                        return item;
                    }
                });
            });
        }
    }

    // tslint:disable-next-line:typedef
    onComposeChatClicked() {
        // this.router.navigate(['new-message']);
        const newMsg = this._matDialog.open(ComposeComponent, {width: '350px', height: '450px'});
        newMsg.afterClosed().subscribe((data) => {
        });
    }

    // tslint:disable-next-line:typedef
    searchChanged(e: any){
        if (this.timer){
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(this.doSearch, 400, e.target.value, this);
    }

    // tslint:disable-next-line:typedef
    doSearch(token: string, obj: any){
        // this._chatService.getRoomsBySearchText(0, 30, token).subscribe((data) => {
        //     console.log(data);
        // });

        // tslint:disable-next-line:variable-name
        const room_terminal: any[] = [];
        obj._chatService.getRoomsBySearchText(0, 30, token).subscribe((response) => {
            if (response && response.success === 1) {
                for (const room of response.data) {
                    if (room.joined_room) {
                        if (room.joined_room.participant1._id === obj.cuser.id) {
                            room.receiver = room.joined_room.participant2;
                        } else {
                            room.receiver = room.joined_room.participant1;
                        }
                    }
                    else{
                        room.receiver = room._id;
                    }

                    room_terminal.push(room);
                }
                obj.user.chatList = room_terminal;
            }
        });
    }
    // tslint:disable-next-line:typedef
    addChatList(messageobj: any){
        // tslint:disable-next-line:variable-name
        const checked_chatList = this.user.chatList.filter((item) => {
            if (item.id === messageobj.room) {
                return item;
            }
        });
        if (checked_chatList && checked_chatList.length > 0 ){
            this.user.chatList =  this.user.chatList.filter((item) => {
                if (item.id === messageobj.room) {
                    if (item){
                        item.hasNewMsg++;
                        item.lastMessage = messageobj.message;
                        item.lastActiveDate = messageobj.time;
                    }
                    this.chatService.setChatNumber(this.chatService.chatNumber.getValue() + 1);
                }
                return item;
            });
        }
        else{

            this.user.chatList.unshift({
                createdAt: messageobj.time,
                direct: true,
                hasNewMsg: 1,
                id: messageobj.room,
                isFriend: false,
                lastActiveDate: messageobj.time,
                lastMessage: messageobj.message,
                lastMessage_type: messageobj.message_type,
                lastSeenDateOfPart1: messageobj.time,
                lastSeenDateOfPart2: [],
                name: messageobj.title,
                participant1: {avatar: messageobj.avatar, _id: messageobj.from, username: messageobj.username},
                receiver: undefined,
                updatedAt: messageobj.time,
                group: []
            });
            this.chatService.setChatNumber(this.chatService.chatNumber.getValue() + 1);
        }

    }

    // tslint:disable-next-line:typedef
    displayChatLabel(individualRoom, displayType) {
        let result = '';
        let index = 0;
        if (displayType === 'name') {
            if (individualRoom.name){
                return individualRoom.name;
            }
            // tslint:disable-next-line:variable-name
            let me_excepting = individualRoom.group.filter(c => {
                if (c._id !== this.cuser.id){
                    return c;
                }
            });
            if (me_excepting.length !== individualRoom.group.length) {
                me_excepting.unshift({username: individualRoom.participant1.username});
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
        }
        return result;
    }

    // tslint:disable-next-line:typedef
    displayProfileImage(individualRoom: any){
        // tslint:disable-next-line:variable-name
        const temp_img = [];
        // tslint:disable-next-line:variable-name
        const temp_name = [];
        // tslint:disable-next-line:variable-name
        let temp_index = 3;
        // tslint:disable-next-line:variable-name
        const me_excepting = individualRoom.group.filter(c => {
            if (c._id !== this.cuser.id){
                return c;
            }
        });
        if (me_excepting.length !== individualRoom.group.length){
            // tslint:disable-next-line:variable-name
            const temp_main_img = individualRoom?.participant1?.avatar ? individualRoom.participant1.avatar : '/assets/images/avatars/katherine.jpg';
            temp_img.push(temp_main_img);
            temp_index = 2;
        }
        // tslint:disable-next-line:variable-name
        const new_clipped = me_excepting.slice(0, temp_index);
        for (const v of new_clipped) {
            // tslint:disable-next-line:variable-name
            const temp_profile = v?.avatar ?  v.avatar : '/assets/images/avatars/katherine.jpg';
            temp_img.push(temp_profile);
        }

        return temp_img;
    }
}


