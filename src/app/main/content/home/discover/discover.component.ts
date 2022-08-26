import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { PostService } from '../../../../shared/services/post/post.service';
import { UserService } from 'app/shared/services/user/user.service';
import { FriendService } from 'app/shared/services/friend/friend.service';
import { Lightbox, LightboxEvent, LIGHTBOX_EVENT} from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import {PostFormDialogCompent} from './post-form/post-form.component';
import { MatDialog } from '@angular/material/dialog';
import { UnfollowDialogComponent } from '../unfollow-dialog/unfollow-dialog.component';
import { SearchConfigService } from 'app/layout/components/toolbar/searchconfig.service';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}


@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  animations: fuseAnimations,
})
export class DiscoverComponent implements OnInit {

  private _subscription: Subscription;
  
  tiles: Tile[] = [
    { text: 'One', cols: 1, rows: 1, color: 'lightblue' },
    { text: 'Two', cols: 1, rows: 1, color: 'lightgreen' },
    { text: 'Three', cols: 1, rows: 1, color: 'lightpink' },
    { text: 'One', cols: 1, rows: 1, color: 'lightblue' },
    { text: 'Two', cols: 1, rows: 1, color: 'lightgreen' },
    { text: 'Three', cols: 1, rows: 1, color: 'lightpink' },
  ];

  posts: any[];
  people: any[];
  discoveredUsers: any[];
  loading: boolean;
  totalCount: number;
  loadedCount: number;
  unfollowDialogRef: any;
  search: string;


  constructor(
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private _lightbox: Lightbox,
    private _lightboxEvent: LightboxEvent,
    public dialog: MatDialog,
    private friendService: FriendService,
    private searchConfigService: SearchConfigService
  ) { 
    // this.search = '';
    // this.searchConfigService._searchSubject.subscribe((value) => {
    //   if (value != null) {
    //     this.onSearch(value);
    //   }
    // });
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {
    // this.loading = false;
    // this.totalCount = 0;
    // this.loadedCount = 0;
    // this.loadPopulates(true);
    //
    // const container = document.querySelector('#container-3');
    // container.addEventListener('ps-y-reach-end', () => {
    //   this.loadMorePosts();
    // });

    
  }

  // loadMorePosts() {
  //   console.log('log more posts', this.loading, this.loadedCount);
  //   if ( this.loadedCount >= this.totalCount || this.loading )
  //   {
  //     return;
  //   }
  //
  //   this.loading = true;
  //
  //   this.postService.getPopulates(this.loadedCount, this.search).subscribe((res) => {
  //     if (res.success == 1 ) {
  //       for ( let post of res.data.post)
  //         this.posts.push( post );
  //       this.loadedCount = this.posts.length;
  //       this.totalCount = res.data.total;
  //     }
  //     this.loading = false;
  //   });
  // }
  //
  // loadPopulates(all:boolean) {
  //   console.log('load populates');
  //   this.loading = true;
  //   this.postService.getPopulates(0, this.search).subscribe((res) => {
  //     console.log('populates => ', res);
  //     if (res.success == 1 ) {
  //       this.posts = res.data.post;
  //       this.loadedCount = this.posts.length;
  //       this.totalCount = res.data.total;
  //     }
  //     this.loading = false;
  //   });
  //
  //   if ( all ) {
  //     this.userService.getPoplarPeople(0).subscribe((data) => {
  //       if (data.success == 1 && data.data.user.length > 0) {
  //         this.discoveredUsers = data.data.user;
  //         this.people = [];
  //         for ( let i = 0; i < 3 && i < this.discoveredUsers.length; i++ ) {
  //           var user = this.discoveredUsers[i];
  //           user.isUpdating = false;
  //           this.people.push(user);
  //         }
  //       }
  //     });
  //   }
  // }
  //
  // openPost(index: number): void {
  //   this.dialog.open(PostFormDialogCompent, {
  //     panelClass: 'post-form-dialog',
  //     data      : {
  //         post: this.posts[index],
  //         index: index,
  //         postCount: this.totalCount,
  //         search: this.search
  //     }
  //   });
  // }
  //
  // getFormattedNumberOnly(number) {
  //   let ret = '';
  //   let temp = Number.parseInt(number + '');
  //     // tslint:disable-next-line:triple-equals
  //   if (temp == undefined) {
  //       return '';
  //   }
  //   var i = 0;
  //   while (temp > 10) {
  //       ret = ((temp % 10) + "") + ret;
  //       if ((i % 3) == 2) {
  //           ret = "," + ret;
  //       }
  //       i++;
  //       temp = Number.parseInt((temp / 10) + "");
  //   }
  //   ret = temp + ret;
  //   return ret;
  // }
  //
  // getFormattedNumber(number) {
  //
  //   var prefNum = 0;
  //   if (number > 1000000) {
  //       prefNum = Number.parseInt((number / 1000000) + "");
  //       return this.getFormattedNumberOnly(prefNum) + "m";
  //   }
  //   else if (number > 1000) {
  //       prefNum = Number.parseInt((number / 1000) + "");
  //       return this.getFormattedNumberOnly(prefNum) + "k";
  //   }
  //   else {
  //       prefNum = Number.parseInt(number + "");
  //       return this.getFormattedNumberOnly(prefNum);
  //   }
  // }
  //
  // onFollow(user) {
  //   console.log('follow user: ' + user._id);
  //   user.isUpdating = true;
  //   this.friendService.follow(user._id).subscribe((res) => {
  //     if (res.success == 1 ) {
  //       user.isFollowing = true;
  //       //this.posts = res.data.post;
  //       //this.loadedCount = this.posts.length;
  //       //this.totalCount = res.data.total;
  //     }
  //     //this.loading = false;
  //     user.isUpdating = false;
  //   });
  // }
  //
  // onUnfollow(user) {
  //
  //
  //   this.unfollowDialogRef = this.dialog.open(UnfollowDialogComponent, {
  //     panelClass: 'unfollow-dialog',
  //     data      : {
  //         user: user
  //     }
  //   });
  //
  //   this.unfollowDialogRef.afterClosed().subscribe(result => {
  //     if ( result )
  //     {
  //       user.isUpdating = true;
  //       this.friendService.unfollow(user._id).subscribe((res) => {
  //         if (res.success == 1 ) {
  //           user.isFollowing = false;
  //         }
  //         user.isUpdating = false;
  //       }, (error) => {
  //         user.isUpdating = false;
  //       });
  //     }
  //     this.unfollowDialogRef = null;
  //   });
  //
  // }
  //
  // onSearch(value) {
  //   console.log("search post: " + value);
  //   this.search = value;
  //   this.posts = [];
  //   this.loadPopulates(false);
  //
  // }



}
