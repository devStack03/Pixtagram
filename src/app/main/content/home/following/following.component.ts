import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { UserService } from '../../../../shared/services/user/user.service';
import * as Userservice1 from '../../../../shared/services/user.service';
import {AppConstants} from '../../../../shared/constants';
import {FriendService} from '../../../../shared/services/friend/friend.service';
import {ConfirmMessageComponent} from '../confirm-message/confirm-message.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {

  @ViewChild('searchField') searchField;
  selectedUsers: any[] = [];
  users: any[] = [];
  loadsAtOnce = 10;
  loading = false;
  searchTerm: any;
  user: any;
  perPage = 20;
  siteUrl = '';
  private timer: any;

  constructor(
      public dialogRef: MatDialogRef<FollowingComponent>,
      private matSnackBar: MatSnackBar,
      private userService: UserService,
      private userService1: Userservice1.UserService,
      private friendService: FriendService,
      private dialog: MatDialog,
      private toastr: ToastrService,
      private router: Router,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
      this.loadUsers(this);
  }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:typedef
  onScroll() {

   }
    // tslint:disable-next-line:typedef
   onSearch(event) {
       const searchText = this.searchField.nativeElement.value;
       this.searchTerm = searchText;
       this.users = [];
       if (this.timer){
           clearTimeout(this.timer);
       }
       this.timer = setTimeout( this.loadUsers, 400, this);
  }

    // tslint:disable-next-line:typedefs typedef
    loadUsers(obj: any, init = false) {
        obj.loading  = true;
        obj.userService1.getFollow(obj.users.length, obj.perPage, obj.data, obj.searchTerm).subscribe((res) => {
            obj.loading = false;
            if (res['success'] === 1 && res['data']){
                for (const u of res['data']){
                    let uinfo = {avatar: '', username: '', _id: '', fType: ''};
                    if (obj.data === 1){
                        uinfo = u.followee;
                    }
                    else{
                        uinfo = u.follower;
                    }
                    obj.users.push({avatar: uinfo.avatar , username: uinfo.username, id: uinfo._id , fType: obj.data});
                }
            }
        }, (error) => {
            obj.loading = false;
        });
    }

    // tslint:disable-next-line:typedef
    setFollow(id: any, ftype: number, fee= 0) {
        if (ftype === 0) {
            this.friendService.unfollowUser(id).subscribe((data) => {
                if (data && data['success'] === 1) {
                    this.users = this.users.filter(u => {
                        if (u.id === id) {
                            u.fType = 0;
                        }
                        return u;
                    });
                }
            }, (error) => {
            });
        }
        else{
            // tslint:disable-next-line:variable-name
            let dialog_exist = null;
            const followFee = fee ? fee : 0;
            if (followFee > 0){
                dialog_exist = this.dialog.open(ConfirmMessageComponent, {data: {confirmMessage: 'You need to charge ' + followFee + 'nudles to follow this user every month'}});
            }
            if (dialog_exist === null){
                this.processFollow(id , followFee);
            }
            else {
                dialog_exist.afterClosed().subscribe(result => {
                    if (result) {
                        this.processFollow(id, followFee);
                    }
                    dialog_exist = null;
                });
            }
        }
    }

    // tslint:disable-next-line:typedef
    private processFollow(followId , followfee){
        this.friendService.followUser(followId , followfee).subscribe((data) => {
            if (data && data['success'] === 1) {
                this.users = this.users.filter(u => {
                    if (u.id === followId) {
                        u.fType = 1;
                    }
                    return u;
                });
                if (data['data'].credit_balance >= 0) {
                    this.userService1.balance.next(data['data'].credit_balance);
                }
            }
            else{
                this.toastr.error(data['error'], 'Following Error', {
                    progressBar: true,
                    timeOut: 5000,
                    enableHtml: true
                });

            }
        }, (error) => {
        });
    }

    // tslint:disable-next-line:typedef
    gotoUsePage(id: any) {
        this.router.navigate(['/users/' + id]);
        this.dialogRef.close();
    }
}
