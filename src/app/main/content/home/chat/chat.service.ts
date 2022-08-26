import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// @ts-ignore
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';
import {Room} from '../../../../shared/models/room.model';
import {AppConfig} from '../../../../shared/config';
import { UserService } from '../../../../shared/services/user/user.service';
import {AppConstants} from '../../../../shared/constants';
// @ts-ignore
@Injectable()
export class  ChatService implements Resolve<any>
{
    contacts: any[];
    chats: any[];
    user: any;
    cuser: any;
    selectedContact: any;
    rooms: any[];
    onChatSelected: BehaviorSubject<any>;
    onContactSelected: BehaviorSubject<any>;
    onChatsUpdated: Subject<any>;
    onUserUpdated: Subject<any>;
    onLeftSidenavViewChanged: Subject<any>;
    onRightSidenavViewChanged: Subject<any>;
    uri = AppConfig.apiURL + 'chat/';
    // tslint:disable-next-line:variable-name
    chat_room = '';
    // tslint:disable-next-line:variable-name
    chat_name: BehaviorSubject<string>;
    chatData: any;
    // tslint:disable-next-line:variable-name
    chat_creator: any;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private userService: UserService,
    )
    {
        this.cuser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        // Set the defaults
        this.onChatSelected = new BehaviorSubject(null);
        this.onContactSelected = new BehaviorSubject(null);
        this.chat_name = new BehaviorSubject('');
        this.onChatsUpdated = new Subject();
        this.onUserUpdated = new Subject();
        this.onLeftSidenavViewChanged = new Subject();
        this.onRightSidenavViewChanged = new Subject();
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContacts(),
                this.getChats(),
                this.getUser(),
                this.getRoomswithScroll(0, 20)
            ]).then(
                ([contacts, chats, user, rooms]) => {
                    // this.contacts = contacts.data;
                    this.chats = chats;
                    this.user = user;
                    this.user.chatList = rooms;
                    this.contacts = [];
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    getChat(selectedContact, chatType = false): Promise<any>
    {
        let chatItem = null;
        if (!chatType) {
             chatItem = this.user.chatList.find((item) => {
                return item === selectedContact;
            });
        }
        else{
            chatItem =  selectedContact;
        }

        if ( !chatItem )
        {
            return;
        }
        this.selectedContact = selectedContact;
        // tslint:disable-next-line:variable-name
        const other_id = chatItem.id;
        this.chat_room = chatItem ? chatItem.id : 'new';
        this.chat_name.next(chatItem ? chatItem.name : '');
        const creator = chatItem ? chatItem.participant1._id : '';
        // tslint:disable-next-line:variable-name
        const creator_name = chatItem ? chatItem.participant1.username : '';
        // tslint:disable-next-line:variable-name
        const creator_image = chatItem ? chatItem.participant1.avatar : '/assets/images/avatars/katherine.jpg';
        this.chat_creator = chatItem ? chatItem.participant1 : null;
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.uri + 'getMessagesNew/' + this.chat_room + '?other_id=' + other_id)
                .subscribe((response: any) => {
                    const dialog: any[] = [];
                    const chat = response.data;
                    for (const message of chat.dialog) {
                       if (message.from._id === this.cuser.id) {
                            message.isSend = true;
                        } else {
                            message.isSend = false;
                        }
                       message.time = message.updatedAt;
                       dialog.unshift(message);
                    }
                    this.chatData = {
                        chatId : this.chat_room,
                        dialog : dialog,
                        contact: chat.contact,
                        creator: creator,
                        creator_name: creator_name,
                        creator_image: creator_image,
                        chatType: chatType
                    };

                    this.onChatSelected.next({...this.chatData});

                }, reject);

        });

    }

    // tslint:disable-next-line:typedef
    updateContactFromChat(contact) {
        this.onChatSelected.next({contact: contact});
    }

    /**
     * Create new chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    createNewChat(contactId): Promise<any>
    {

        return new Promise((resolve, reject) => {

            const contact = this.contacts.find((item) => {
                return item.id === contactId;
            });

            const chatId = FuseUtils.generateGUID();

            const chat = {
                id    : chatId,
                dialog: []
            };

            const chatListItem = {
                contactId      : contactId,
                id             : chatId,
                lastMessageTime: '2017-02-18T10:30:18.931Z',
                name           : contact.name,
                unread         : null
            };

            // Add new chat list item to the user's chat list
            this.user.chatList.push(chatListItem);

            // Post the created chat
            this._httpClient.post('api/chat-chats', {...chat})
                .subscribe((response: any) => {

                    // Post the new the user data
                    this._httpClient.post('api/chat-user/' + this.user.id, this.user)
                        .subscribe(newUserData => {

                            // Update the user data from server
                            this.getUser().then(updatedUser => {
                                this.onUserUpdated.next(updatedUser);
                                resolve(updatedUser);
                            });
                        });
                }, reject);
        });
    }

    /**
     * Select contact
     *
     * @param contact
     */
    selectContact(contact): void
    {
        this.onContactSelected.next({
            contact: contact,
            roomId: this.chat_room,
            chat_creator: this.chat_creator,
            currentUserId: this.cuser.id
        });
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void
    {
        this.user.status = status;
    }

    /**
     * Update user data
     *
     * @param userData
     */
    updateUserData(userData): void
    {
        this._httpClient.post('api/chat-user/' + this.user.id, userData)
            .subscribe((response: any) => {
                    this.user = userData;
                }
            );
    }

    /**
     * Update the chat dialog
     *
     * @param chatId
     * @param dialog
     * @returns {Promise<any>}
     */
    updateDialog(chatId, dialog): Promise<any>
    {
        return new Promise((resolve, reject) => {

            const newData = {
                id    : chatId,
                dialog: dialog
            };

            this._httpClient.post('api/chat-chats/' + chatId, newData)
                .subscribe(updatedChat => {
                    resolve(updatedChat);
                }, reject);
        });
    }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.uri + 'chat-contacts')
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }



    /**
     * Get chats
     *
     * @returns {Promise<any>}
     */
    getChats(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.uri + 'chat-chats')
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getRoomsBySearchText(start: number, count: number, searchText = ''): Observable<any> {
        return this._httpClient.post(this.uri + 'testChat', {start: start, count: count, searchText: searchText});
    }

    getRoomswithScroll(start: number, count: number, searchText= ''): Promise<any> {

        // tslint:disable-next-line:variable-name
        const room_terminal: any[] = [];
        return new Promise((resolve, reject) => {
            this._httpClient.post(this.uri + 'testChat', {start: start, count: count, searchText: searchText})
                .subscribe((response: any) => {
                    if (response && response.success === 1) {
                        for (const room of response.data) {
                            room.receiver = room._id;
                            room_terminal.push(room);
                        }
                    }
                    resolve(room_terminal);
                }, reject);
        });
    }


    /**
     * Get user
     *
     * @returns {Promise<any>}
     */
    getUser(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.uri + 'chat-user')
                .subscribe((response: any) => {
                    resolve(response.data[0]);
                }, reject);
        });
    }

    create(messageInfo): Observable<any> {
        return this._httpClient.post(this.uri, messageInfo);
    }

    transferBalance(messageId): Observable<any> {
        return this._httpClient.post(this.uri + 'transferBalance', {messageId: messageId});
    }

    updateRoom(param = {}): Observable<any>{
        return this._httpClient.post(this.uri + 'updateRoom', param);
    }
}
