import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/shared/services/user/user.service';
import { Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { UnfollowDialogComponent } from '../../../unfollow-dialog/unfollow-dialog.component';
import { FriendService } from 'app/shared/services/friend/friend.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {

  users: any[];
  loading: boolean;
  totalCount: number;
  loadedCount: number;
  unfollowDialogRef: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private _lightbox: Lightbox,
    public dialog: MatDialog,
    private friendService: FriendService
  ) { }

    // tslint:disable-next-line:typedef
  ngOnInit() {
    this.loading = false;
    this.totalCount = 0;
    this.loadedCount = 0;
    this.users = [];
    this.loadPopulars();

    const container = document.querySelector('#container-3');
    container.addEventListener('ps-y-reach-end', () => {
      this.loadPopulars();
    });
  }

    // tslint:disable-next-line:typedef
  handleScroll(event) {

  }

    // tslint:disable-next-line:typedef
  loadPopulars() {
    if ( (this.totalCount > 0 && this.loadedCount >= this.totalCount) || this.loading ) 
    {
      return;
    }

    this.loading = true;

    this.userService.getPoplarPeople(this.loadedCount).subscribe((res) => {
      if (res.success === 1 ) {
        for ( const user of res.data.user) {
          user.isUpdating = false;
          this.users.push( user );
        }
        this.loadedCount = this.users.length;
        this.totalCount = res.data.total;
      }
      this.loading = false;
    });
  }

    // tslint:disable-next-line:typedef
  onFollow(user) {
    console.log('follow user: ' + user._id);
    user.isUpdating = true;
    this.friendService.follow(user._id).subscribe((res) => {
      if (res.success === 1 ) {
        user.isFollowing = true;
      }

      user.isUpdating = false;
    });
  }

    // tslint:disable-next-line:typedef
  onUnfollow(user) {
    

    this.unfollowDialogRef = this.dialog.open(UnfollowDialogComponent, {
      panelClass: 'unfollow-dialog',
      data      : {
          user: user
      }
    });

    this.unfollowDialogRef.afterClosed().subscribe(result => {
      if ( result )
      {
        user.isUpdating = true;
        this.friendService.unfollow(user._id).subscribe((res) => {
          if (res.success === 1 ) {
            user.isFollowing = false;
          }
          user.isUpdating = false;
        }, (error) => {
          user.isUpdating = false;
        });
      }
      this.unfollowDialogRef = null;
    });
    
  }

}
