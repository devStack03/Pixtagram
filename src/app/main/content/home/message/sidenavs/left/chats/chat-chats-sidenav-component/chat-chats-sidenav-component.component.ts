import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
    selector: 'app-chat-chats-sidenav-component',
    templateUrl: './chat-chats-sidenav-component.component.html',
    styleUrls: ['./chat-chats-sidenav-component.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatChatsSidenavComponentComponent implements OnInit, OnDestroy{

    chats: any[];
    chatSearch: any;
    contacts: any[];
    searchText: string;
    user: any;
    constructor() {
        this.chatSearch = {
            name: ''
        };
        this.searchText = '';
    }

    ngOnInit(): void {
        this.user = {
            avatar: 'assets/images/avatars/profile.jpg',
            id: '5725a6802d10e277a0f35724',
            mood: 'it\'s a status....not your diary...',
            name: 'John Doe',
            status: 'online',
            chatList: [
                {
                    contactId: "5725a680b3249760ea21de52",
                    id: "1725a680b3249760ea21de52",
                    lastMessage: "You are the worst!",
                    lastMessageTime: "2017-06-12T02:10:18.931Z",
                    name: "Alice Freeman",
                    unread: 4
                }
            ]
        };
        this.chats = [
            {
                dialog:[{
                    message: "Quickly come to the meeting room 1B, we have a big server issue",
                    time: "2017-03-22T08:54:28.299Z",
                    who: "5725a680b3249760ea21de52"
                }],
                id: "1725a680b3249760ea21de52"
            }
        ];

        this.contacts = [{
            avatar: "assets/images/avatars/alice.jpg",
            id: "5725a680b3249760ea21de52",
            mood: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            name: "Alice Freeman",
            status: "online"
        }];
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
    }

    changeLeftSidenavView(view): void
    {

    }
    setUserStatus(status): void
    {

    }
    /**
     * Logout
     */
    logout(): void
    {
        console.log('logout triggered');
    }

    getChat(contact): void
    {
        // this._chatService.getChat(contact);
        //
        // if ( !this._mediaObserver.isActive('gt-md') )
        // {
        //     this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
        // }
    }
}
