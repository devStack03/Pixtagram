import {
    AfterViewInit,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { S3UploaderService } from '../../../../../shared/services/aws/s3-uploader.service';
import { ChatService } from 'app/main/content/home/chat/chat.service';
import {SocketService} from '../../../../../shared/services/socket.service';
import {FuncsService } from '../../../../../shared/services/funcs/funcs.service';
import {AppConstants} from '../../../../../shared/constants';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmMessageComponent} from "../../confirm-message/confirm-message.component";
import {UserService} from "../../../../../shared/services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector     : 'chat-view',
    templateUrl  : './chat-view.component.html',
    styleUrls    : ['./chat-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewInit
{
    // tslint:disable-next-line:variable-name
    emoji_msg = '';
    // tslint:disable-next-line:variable-name
    sender_pic: string;
    // tslint:disable-next-line:variable-name
    self_pic: string;
    cuser: any;
    cimage: string;
    user: any;
    chat: any;
    dialog: any;
    contact: any;
    rname: string;
    rimages: string[];
    roomName: BehaviorSubject<string>;
    replyInput: any;
    selectedChat: any;
    isNewMessage = true;
    showEmojiPicker = false;
    photos: string[];
    postMediaFee = 0;
    newMsg = null;
    // tslint:disable-next-line:variable-name
    txt_msg = '';
    file: any;
    // tslint:disable-next-line:variable-name
    message_type: any;
    // tslint:disable-next-line:variable-name
    m_avatar = '';
    // tslint:disable-next-line:variable-name
    msg_contacts = [];
    @ViewChild(FusePerfectScrollbarDirective)
    directiveScroll: FusePerfectScrollbarDirective;

    @ViewChildren('replyInput')
    replyInputField;

    @ViewChild('replyForm')
    replyForm: NgForm;

    // Private
    private _unsubscribeAll: Subject<any>;

    @ViewChild('imgPhoto') imgPhoto;
    @ViewChild('imgVideo') imgVideo;
    @BlockUI() blockUI: NgBlockUI;

    _validVideoFileExtensions = ['.flv', '.avi', '.mov', '.mpg', '.wmv', '.m4v', '.mp4', '.wma', '.3gp'];
    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService,
        private uploaderService: S3UploaderService,
        private socketService: SocketService,
        private funcsService: FuncsService,
        private _matDialog: MatDialog,
        private userService: UserService,
        private _matSnackBar: MatSnackBar,
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.photos = [];
        this.contact = [];
        this.message_type = 1;
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
        this.cimage = this.cuser ?.avatar ? this.cuser.avatar : 'assets/images/avatars/profile.jpg';
        this.roomName = this._chatService.chat_name;
        this._chatService.onChatSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(chatData => {
                if ( chatData )
                {
                    this.msg_contacts = [];
                    this.selectedChat = chatData;
                    this.contact = chatData.contact;
                    this.dialog = chatData.dialog;
                    this.sender_pic = this.contact ?.avatar ? this.contact.avatar : 'assets/images/avatars/profile.jpg';
                    this.self_pic = this.cuser ?.avatar ? this.cuser.avatar : 'assets/images/avatars/profile.jpg';
                    if (this.selectedChat && this.selectedChat.chatId) {
                        this.socketService.joinRoom(this.selectedChat.chatId);
                    }

                    this.readyToReply();
                    this.msg_contacts.push(this.selectedChat.creator);
                    for (const m of this.contact) {
                        this.msg_contacts.push(m._id);
                    }
                    this.msg_contacts = this.msg_contacts.filter((m) => {
                        if (m !== this.cuser.id) {
                            return m;
                        }
                    });
                    this._chatService.chat_name.pipe(takeUntil(this._unsubscribeAll))
                        .subscribe(rname => {
                            this.rname = this.roomName.getValue() ? this.roomName.getValue() : this.displayChatLabel(this.contact);
                        });
                    this.rimages = this.displayProfileImage();
                    if(this.dialog){
                        this.dialog = this.dialog.filter((item)=> {
                            item.blur = false;
                            if(item.from._id !== this.cuser.id && item.media && item.postMediaFee > 0){
                                if(!item.purchaseList || item.purchaseList.length == 0){
                                    item.blur = true;
                                }
                                else{
                                    const purchased = item.purchaseList.includes(this.cuser.id)
                                    if(!purchased){
                                        item.blur = true;
                                    }
                                }
                            }
                            return item;
                        });
                    }
                }
            });

        this.socketService.getMessages().pipe(takeUntil(this._unsubscribeAll)).subscribe((message: any) => {
            if (this.selectedChat && message.room === this.selectedChat.chatId)
            {
                let pushmsg = false;
                if (message.from.id === this.selectedChat.creator){
                    pushmsg = true;
                }
                else{
                    const filterusr = this.selectedChat.contact.filter((item) => {
                        if (item._id === message.from.id){
                            return item;
                        }
                    });
                    if (filterusr.length > 0) {
                        pushmsg = true;
                    }
                }

                if (pushmsg) {
                    message.isSend = false;
                    this.dialog.push(message);
                    this.scrollToBottom();
                    this.m_avatar = message.avatar;
                }
            }
        });

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Decide whether to show or not the contact's avatar in the message row
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    shouldShowContactAvatar(message, i): boolean
    {
        return (
            ((this.dialog[i + 1] && this.dialog[i + 1].isSend !== this.dialog[i].isSend) || !this.dialog[i + 1])
        );
    }

    /**
     * Check if the given message is the first message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isFirstMessageOfGroup(message, i): boolean
    {
        return (i === 0 || this.dialog[i - 1] && this.dialog[i - 1].isSend !== message.isSend);
    }

    /**
     * Check if the given message is the last message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isLastMessageOfGroup(message, i): boolean
    {
        return (i === this.dialog.length - 1 || this.dialog[i + 1] && this.dialog[i + 1].isSend !== message.isSend);
    }

    /**
     * Select contact
     */
    selectContact(): void
    {
        if (this.selectedChat && this.selectedChat.chatType) {
            return;
        }
        else{
            this._chatService.selectContact(this.contact);
        }
    }

    /**
     * Ready to reply
     */
    readyToReply(): void
    {
        setTimeout(() => {
            this.focusReplyInput();
            this.scrollToBottom();
        });
    }

    /**
     * Focus to the reply input
     */
    focusReplyInput(): void
    {
        setTimeout(() => {
            this.replyInput.focus();
        });
    }

    /**
     * Scroll to the bottom
     *
     * @param {number} speed
     */
    scrollToBottom(speed?: number): void
    {
        speed = speed || 400;
        if ( this.directiveScroll )
        {
            this.directiveScroll.update();

            setTimeout(() => {
                this.directiveScroll.scrollToBottom(0, speed);
            });
        }
    }

    /**
     * Reply
     */
    reply(event): void
    {
        const to = [];
        let sent = false;
        event.preventDefault();

        if ( !this.replyForm.form.value.message  && !this.file)
        {
            return;
        }
        const message = {
            title: this.rname,
            uids: this.msg_contacts,
            username: this.cuser ?.username ? this.cuser.username : '',
            from: {id: this.cuser.id, avatar: this.cuser?.avatar ?  this.cuser.avatar : '/assets/images/avatars/katherine.jpg'},
            message: this.replyForm.form.value.message,
            message_type: this.message_type,
            isSend: true,
            media: '',
            time: new Date().toISOString(),
            room: this.selectedChat.chatId,
            avatar: this.cuser?.avatar ?  this.cuser.avatar : '/assets/images/avatars/katherine.jpg',
            postMediaFee: this.postMediaFee
        };

        if (this.file) {
            if (this.message_type > 3) {
                this.blockUI.stop();
                alert('Sorry, unsupported file type');
                return;
            }

            this.uploaderService.uploadFile(this.file, (err, data) => {
                if (AppConstants.TEST) {
                    err = null;
                    data = { Location: 'http://localhost:4200/assets/images/avatars/Abbott.jpg' };
                }

                if (err) {
                    console.log('There was an error uploading your file: ', err);

                    this.blockUI.stop();
                    return err;
                }
                message['media'] = data.Location ? data.Location : '';

                // tslint:disable-next-line:prefer-for-of

                message['to'] = this.contact._id;

                // tslint:disable-next-line:no-shadowed-variable
                this._chatService.create(message).subscribe((data: any) => {
                    this.blockUI.stop();
                    if (data && data['success']) {
                        to.push(message);
                        message['room'] = data['data'].room;
                        this.socketService.sendMessage(message, '');
                        this.dialog.push(message);
                        this.addChatList(data['data']);
                    }
                    this.replyForm.reset();
                    this.readyToReply();
                    this.onRemovePhoto();
                });

            });
        }

        else{
            message['postMediaFee'] = 0;
            message['to'] = this.contact._id;
            this._chatService.create(message).subscribe((data) => {
                this.blockUI.stop();
                if (data && data['success']) {
                    if (!sent){
                        sent = true;
                    }
                    to.push(message);
                    message['room'] = data['data'].room;
                    this.socketService.sendMessage(message, '');
                    this.dialog.push(message);
                    this.addChatList(data['data']);
                }
                this.replyForm.reset();
                this.readyToReply();
                this.onRemovePhoto();
            });
        }
        this.showEmojiPicker = false;
    }

    onFileInput(file): void {
        this.file = file;

        if (this.uploaderService.ValidateImageFile(this.file.name)) {
            this.message_type = 2;
            this.imgPhoto.nativeElement.src = URL.createObjectURL(file);
            this.newMsg = this._matDialog.open(ConfirmMessageComponent, {data: {follow: true}});
        }
        else if (this.ValidateVideoFile(this.file.name)) {
            this.message_type = 3;
            const reader = new FileReader();
            const url = URL.createObjectURL(file);
            reader.onload = () => {
                this.imgVideo.nativeElement.src = url;
                this.imgVideo.nativeElement.play();
            };
            reader.readAsDataURL(file);
            this.newMsg = this._matDialog.open(ConfirmMessageComponent, {data: {follow: true}});
        }
        if(this.newMsg != null){
            this.newMsg.afterClosed().subscribe((data) => {
                this.postMediaFee = 0;
                if(data.fee){
                    this.postMediaFee = data.fee;
                }
            });
        }
    }
    // tslint:disable-next-line:typedef
    private ValidateVideoFile(sFileName) {
        if (sFileName.length > 0) {
            let blnValid = false;
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < this._validVideoFileExtensions.length; j++) {
                const sCurExtension = this._validVideoFileExtensions[j];
                // tslint:disable-next-line:triple-equals
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    break;
                }
            }
            if (!blnValid) {
                return false;
            }
        }
        return true;
    }
    onRemovePhoto(): void {
        this.message_type = 1;
        this.file = null;
        this.photos = [];
    }
    onOpenFile(id): void {
        document.getElementById(id).click();
    }
    // tslint:disable-next-line:typedef
    addChatList(data: any){

        if (!this.selectedChat || !this.selectedChat.chatType){
            if (this.selectedChat.chatId === 'new'){
                return;
            }
            this.user.chatList = this.user.chatList.filter((item) => {
                if (item.id === data.room){
                    item.lastMessage = data.message;
                }
                return item;
            });
        }
    }
    // tslint:disable-next-line:typedef
    addEmoji(event) {
        const { emoji_msg } = this;
        const text = `${emoji_msg}${event.emoji.native}`;
        this.txt_msg += text;
    }
    // tslint:disable-next-line:typedef
    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }
    // tslint:disable-next-line:typedef
    displayChatLabel(individualRoom) {
        let result = '';
        let index = 0;

        // tslint:disable-next-line:variable-name
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

    // tslint:disable-next-line:typedef
    displayProfileImage(){
        // tslint:disable-next-line:variable-name
        const temp_img = [];
        // tslint:disable-next-line:variable-name
        const temp_name = [];
        // tslint:disable-next-line:variable-name
        let temp_index = 3;
        // tslint:disable-next-line:variable-name
        const me_excepting = this.contact.filter(c => {
            if (c._id !== this.cuser.id){
               return c;
            }
        });
        if (me_excepting.length !== this.contact.length){
            temp_img.push(this.selectedChat.creator_image);
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

    // tslint:disable-next-line:typedef
    displayDate(t){
        return this.funcsService.displayTime(t) + ' (' + this.funcsService.formatFromNow(t) + ') ';
    }

    // tslint:disable-next-line:typedef
    closeChatView() {
        // this.dialogRef.close();
    }

    onPostPay(message: any) {
        if (message.postMediaFee <= 0) {
            message.blur = false;
        }
        else {
            message.loading = true;
            this._chatService.transferBalance(message.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
                if (data['success'] === 1 && data['data'] && data['data'].balance) {
                    this.userService.balance.next(data['data'].balance);
                    this.dialog = this.dialog.filter((item) => {
                        if(item.id == message.id) {
                            item.purchaseList.push(this.cuser.id);
                            item.blur = false;
                        }
                        return item;
                    });
                }  else if (data['success'] === 0 && data['error']) {
                    this._matSnackBar.open(data['error'], '', {
                        verticalPosition: 'bottom',
                        politeness: 'assertive',
                        duration: 1500
                    });
                }
                message.loading = false;
            }, (err) => {
                message.loading = false;
            });
        }
    }
}
