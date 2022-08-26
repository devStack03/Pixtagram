import {Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { S3UploaderService } from '../../../../shared/services/aws/s3-uploader.service';
import { PostService } from '../../../../shared/services/post/post.service';
import { UserService } from '../../../../shared/services/user/user.service';
import { AppConstants, Const_countries } from '../../../../shared/constants';
import { SearchConfigService } from 'app/layout/components/toolbar/searchconfig.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ChatService} from '../../../../shared/services/chat/chat.service';
import {SocketService} from '../../../../shared/services/socket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-message-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ComposeComponent implements OnInit {

  @ViewChild('searchField') searchField;
  private timer: any;
  users: any[] = [];
  user: any;
  searchTerm: any;
  selectedUsers: any[] = [];
  loadsAtOnce = 10;
    // tslint:disable-next-line:variable-name
  existed_users = [];
  roomId = '';
  loading = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uploaderService: S3UploaderService,
    private postService: PostService,
    private userService: UserService,
    private searchConfigService: SearchConfigService,
    public dialogRef: MatDialogRef<ComposeComponent>,
    private chatService: ChatService,
    private socketService: SocketService,
    private matSnackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchConfigService.setSearch('');
    this.searchConfigService.subscribe((value) => {
      if (value === 'new-message') {
        this.onCompose();
      }
    });

    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.searchTerm = '';
    this.users = [];
    if (this.data && this.data.contact) {
        for (const exists of this.data.contact) {
            this.existed_users.push(exists._id);
        }

        this.roomId = this.data.roomId;
    }
    this.loadUsers(this);
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {

  }

    // tslint:disable-next-line:typedef
  onSearch(event) {

    this.users = [];
    const searchText = this.searchField.nativeElement.value;
    this.searchTerm = searchText;
    this.users = [];
    if (this.timer){
       clearTimeout(this.timer);
    }
    this.timer = setTimeout( this.loadUsers, 400, this);
  }

    // tslint:disable-next-line:typedef
  onScroll() {
    if (this.loading){
        return;
    }
    this.loading  = true;
    this.loadUsers(this);
  }

    // tslint:disable-next-line:typedef
  loadUsers(obj: any) {
      this.loading  = true;
      obj.userService.getBySearchWithUsername(obj.searchTerm, obj.users.length, obj.loadsAtOnce, obj.existed_users).subscribe((res) => {
          this.loading = false;
          if (res.success === 1) {
            for (const user of res.data.user) {
              if (user._id === obj.user.id) {
                continue;
              }
              user.selected = (obj.findSelectedUser(user) > -1);
              obj.users.push(user);
            }
          }
    }, (error) => {
          this.loading = false;
    });
  }

    // tslint:disable-next-line:typedef
  findSelectedUser(user) {
    for (let i = 0; i < this.selectedUsers.length; i++) {
      if (user._id === this.selectedUsers[i]._id) {
        return i;
      }
    }
    return -1;
  }

    // tslint:disable-next-line:typedef
  onUserClicked(selUser, v = null) {
    const i = this.findSelectedUser(selUser);
    if (v == null) {
        if (i === - 1) {
            selUser.selected = true;
            this.selectedUsers.push(selUser);
        } else {
            selUser.selected = false;
            this.selectedUsers.splice(i, 1);
        }
    }
    else{
        selUser.selected = v;
        this.selectedUsers.splice(i, 1);
        this.users = this.users.filter( (u) => {
            if (u._id === selUser._id){
                u.selected = v;
            }
            return u;
        });
    }
  }

    // tslint:disable-next-line:typedef
  onCompose() {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      return;
    }

    const chatRoom = {};
    chatRoom['selectedUsers'] = this.selectedUsers;
    chatRoom['new'] = true;
    sessionStorage.setItem(AppConstants.chatRoom, JSON.stringify(chatRoom));
    this.router.navigate(['chat', 'new']);

  }
    // tslint:disable-next-line:typedef
    goNewChat(user: any) {
        user.selected = true;
        this.selectedUsers.push(user);
        this.onCompose();
    }

    // tslint:disable-next-line:typedef
    addGroup() {
        if (!this.selectedUsers || this.selectedUsers.length === 0) {
            return;
        }
        this.chatService.createRoom({usrs: this.selectedUsers, roomId: this.roomId}).subscribe((data: any) => {
            if (data['success'] === 1 && data.data){
                this.dialogRef.close({event: 'yes', data: data.data});
                this.socketService.sendNotification({content: 'room', data: data.data, code: data.data.code});
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
}
