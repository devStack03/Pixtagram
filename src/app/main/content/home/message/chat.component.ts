import { AfterViewInit, AfterViewChecked, Component, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation  } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { S3UploaderService } from '../../../../shared/services/aws/s3-uploader.service';
import { ChatService } from '../../../../shared/services/chat/chat.service';
import { UserService } from '../../../../shared/services/user/user.service';
import { AppConstants, Const_countries } from '../../../../shared/constants';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import {SocketService} from '../../../../shared/services/socket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-message-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ChatComponent implements OnInit, OnDestroy  {

  user: any;
  contact: any;
  replyInput: any;
  timeout: any = null;
    // tslint:disable-next-line:variable-name
  cur_typing: any = null;
  submitted = false;
  loading = true;
  room: any;
  isNewMessage = true;
    // tslint:disable-next-line:variable-name
  message_type: any;
  file: any;
  photos: string[];
  updatedPhotos: string[];
  typing: any;
  dialog: any[] = [];
  private _unsubscribeAll: Subject<any>;
  @BlockUI() blockUI: NgBlockUI;
  @ViewChild(FusePerfectScrollbarDirective)
  directiveScroll: FusePerfectScrollbarDirective;
  @ViewChildren('replyInput') replyInputField;
  @ViewChild('replyForm') replyForm: NgForm;
  @ViewChild('imgPhoto') imgPhoto;
  @ViewChild('imgVideo') imgVideo;
  _validVideoFileExtensions = ['.flv', '.avi', '.mov', '.mpg', '.wmv', '.m4v', '.mp4', '.wma', '.3gp'];
  // Private


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uploaderService: S3UploaderService,
    public  chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute,
    private socketService: SocketService,
    private _matSnackBar: MatSnackBar,
  ) {
    this._unsubscribeAll = new Subject();
    this.photos = [];
    this.contact = [];
    this.message_type = 1;

    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));

    const chatRoom = JSON.parse(sessionStorage.getItem(AppConstants.chatRoom));
      // tslint:disable-next-line:triple-equals
    if (chatRoom && chatRoom['new'] == true) {

    }
    if (this.route.snapshot.params && this.route.snapshot.params.id) {
        this.socketService.joinRoom(this.route.snapshot.params.id);
        // tslint:disable-next-line:triple-equals
        this.isNewMessage = this.route.snapshot.params.id == 'new' ? true : false;
        if (this.isNewMessage) {
            this.contact = chatRoom['selectedUsers'];
        } else {

        this.chatService.getRoom(this.route.snapshot.params.id).subscribe((data) => {
            // tslint:disable-next-line:triple-equals
          if (data && data['success'] == 1) {
            this.room = data.data.room[0];
              // tslint:disable-next-line:triple-equals
            if (this.room.participant1._id == this.user.id) {
              this.contact.push(this.room.participant2);
            } else {
              this.contact.push(this.room.participant1);
            }
          }
        });

        this.loading = true;
        this.chatService.getMessages(this.route.snapshot.params.id).subscribe((data) => {
                // tslint:disable-next-line:triple-equals
          if (data && data['success'] == 1) {
            for (const message of data.data) {
                // tslint:disable-next-line:triple-equals
              if (message.from._id == this.user.id) {
                message.isSend = true;
              } else {
                message.isSend = false;
              }
              this.dialog.unshift(message);
              // this.chatService.addMsg(message, 1);
            }
          }
          this.loading = false;
        },
          (error) => {
            this.loading = false;
          });
      }
    }

  }

    // tslint:disable-next-line:typedef
  ngOnInit() {

      if (this.route.snapshot.params && this.route.snapshot.params.id){
          // this.socketService.getMessages(this.route.snapshot.params.id).subscribe((message: any) => {
          //     this.dialog.push(message);
          //     this.typing = '';
          // });

      }

      this.socketService.typingNotification().subscribe((typing: any) => {
         if (!typing){
             this.typing = '';
         }
         else{
             this.typing = 'typing...';
         }
      });
      this.chatService.currentDialog.pipe(takeUntil(this._unsubscribeAll)).subscribe(dialog => {
          this.dialog = dialog;
          this.typing = '';
          this.scrollToBottom();
      });
  }

    // tslint:disable-next-line:use-lifecycle-interface typedef
    ngOnDestroy() {
        if (this.route.snapshot.params && this.route.snapshot.params.id){
            this.socketService.leaveRoom({room: this.route.snapshot.params.id, uid: ''});
        }
        this.chatService.initMSG();
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngAfterViewInit(): void {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();

     }


  readyToReply(): void {
    setTimeout(() => {
      this.message_type = 1;
      this.focusReplyInput();
      this.scrollToBottom();

    });
  }

  /**
   * Focus to the reply input
   */
  focusReplyInput(): void {
    setTimeout(() => {
        this.replyInput.value = '';
        this.replyInput.focus();
    });
  }


  /**
   * Scroll to the bottom
   *
   * @param {number} speed
   */
  scrollToBottom(speed?: number): void {
    speed = speed || 400;
    if (this.directiveScroll) {
      this.directiveScroll.update();

      setTimeout(() => {
        this.directiveScroll.scrollToBottom(0, speed);
      });
    }
  }


  onSubmit(): void {
    const to = [];
    let sent = false;
    if (!this.replyForm.form.value.message && !this.file) {
      return;
    }

    this.loading = true;
    this.submitted = true;

    const message = {
      from: this.user.id,
      message: this.replyForm.form.value.message,
      message_type: this.message_type,
      isSend: true,
      media: '',
      time: new Date().toISOString()
    };

    if (this.file) {

      if (this.message_type > 3) {
        this.blockUI.stop();
        alert('Sorry, unsupported file type');
        this.submitted = false;
        this.loading = false;
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
          this.submitted = false;
          this.loading = false;
          return err;
        }
        message['media'] = data.Location ? data.Location : '';

          // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.contact.length; i++) {

          message['to'] = this.contact[i]._id;

            // tslint:disable-next-line:no-shadowed-variable
          this.chatService.create(message).subscribe((data) => {

            this.submitted = false;
            this.loading = false;

            this.blockUI.stop();
            if (data && data['success']) {
                this.chatService.addMsg(message, 0);
                to.push(message);
                this.replyForm.reset();
                this.readyToReply();
                this.socketService.sendMessage(message, '');
            }
          });
        }
      });
    } else {
      // Message
        // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.contact.length; i++) {

        message['to'] = this.contact[i]._id;

        this.chatService.create(message).subscribe((data) => {

          this.submitted = false;
          this.loading = false;

          this.blockUI.stop();
          if (data && data['success']) {
              if (!sent){
                  this.chatService.addMsg(message, 0);
                  sent = true;
              }
              to.push(message);
              this.replyForm.reset();
              this.readyToReply();
              this.socketService.sendMessage(message, '');
          }
        });
      }


    }

  }


    // tslint:disable-next-line:typedef
  formatFromNow(value) {
    return moment(value).fromNow();
  }

  onOpenFile(id): void {
    document.getElementById(id).click();
  }

  onFileInput(file): void {

    this.file = file;

    if (this.uploaderService.ValidateImageFile(this.file.name)) {
      this.message_type = 2;
      this.imgPhoto.nativeElement.src = URL.createObjectURL(file);
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

    typingTimeout(): void{
      if (this.room){
          this.socketService.sendTyping({typing: false, room: this.room.id});
      }

      if (this.timeout != null){
          this.timeout = null;
      }
  }

    // tslint:disable-next-line:typedef
   onKeyDowns(id): void {
       // tslint:disable-next-line:triple-equals
      if (id == 2){
          if (this.timeout != null){
              clearTimeout(this.timeout);
              this.timeout = null;
          }
          this.onSubmit();
      }
  }

  onRemovePhoto(): void {
    this.message_type = 1;
    this.file = null;
    this.photos = [];
  }

    onKeys($event: KeyboardEvent): void {
       if ($event.keyCode !== 13){
           if (this.timeout == null && this.room){
               this.socketService.sendTyping({typing: true, room: this.room.id});
           }
           if (this.timeout !== null){
               clearTimeout(this.timeout);
           }
           // @ts-ignore
           this.timeout = setTimeout(() => {
               this.typingTimeout();
           }, 1500);
       }
       else{

       }
    }
}
