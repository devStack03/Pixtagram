import { Component, ViewEncapsulation, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AppConstants } from '../../../../shared/constants';
import { UserService } from '../../../../shared/services/user/user.service';
import { PostService } from 'app/shared/services/post/post.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { BookmarkService } from 'app/shared/services/bookmark/bookmark.service';
import { FriendService } from 'app/shared/services/friend/friend.service';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ProfileBookmarksComponent } from './tabs/bookmark/list.component';
import { ProfileFeedComponent } from './tabs/feed/feed.component';
import { ProfileLikesComponent } from './tabs/like/like.component';
import { ProfilePostsComponent } from './tabs/posts/posts.component';
import { MatTabGroup, MatTabHeader, MatTab } from '@angular/material/tabs';
import * as SecondUser from '../../../../shared/services/user.service';
import {ConfirmMessageComponent} from '../confirm-message/confirm-message.component'; // for scroll.
import * as Userservice1 from '../../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import {FollowingComponent} from '../following/following.component';
import {ChatViewComponent} from '../chat/chat-view/chat-view.component';
import {pipe, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { ChatService } from 'app/main/content/home/chat/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: any;
  isMine = false;
  isFollowed = false;
  currentUser: any;
  currentTab = 0;
  posts = [];
  loading = true;
  returnParams: any = { 'returnUrl': 'profile' };
    // tslint:disable-next-line:variable-name
  following_state = false;
  loadsAtOnce = 12;
  currentSort = 'np'; // newest post
  isScrolled = false;
  private _unsubscribeAll: Subject<any>;
  @ViewChild('avatarCropDialog') avatarCropDialog;
  @ViewChild('profilePostView') profilePostView: ProfilePostsComponent;
  @ViewChild('profileBookmarkView') profileBookmarkView: ProfileBookmarksComponent;
  @ViewChild('profileFeedView') profileFeedView: ProfileFeedComponent;
  @ViewChild('profileLikeView') profileLikeView: ProfileLikesComponent;
  @ViewChild('profileTabs') profileTabs: MatTabGroup;

  avatarChangedEvent: any = '';
  avatarCroppedImage: any = 'assets/images/avatars/profile.jpg';
  photos: any = [''];

  constructor(
    private _postService: PostService,
    private userService: UserService,
    private likeService: LikeService,
    private bookmarkService: BookmarkService,
    private friendService: FriendService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private ouserService: SecondUser.UserService,
    private uservice: Userservice1.UserService,
    private toastr: ToastrService,
    private _matDialog: MatDialog,
    private chatService: ChatService
  ) {
    this.photos = [''];
    this._unsubscribeAll = new Subject();
    const localUser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.currentUser  = localUser;
    if (this.route.snapshot.params && this.route.snapshot.params.id) {
      const userId = this.route.snapshot.params.id;

      if (localUser.id === userId) {

        // It is my profile
        this.isMine = true;
      } else {

        // It is other's profile
        this.isMine = false;
        this.returnParams['returnUrl'] = '/users/' + userId;
      }
      this.loadUserInfo(userId);

    } else {
      this.isMine = true;
      // It is my profile
      this.loadUserInfo(localUser.id);
    }

    this.loading = true;
    this.user = localUser;
  }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // tslint:disable-next-line:typedef
  ngOnInit() {
    const homeContainer = document.querySelector('#container-3');
    if (homeContainer) {
      homeContainer.addEventListener('ps-y-reach-end', () => {

      });
    }

    setTimeout(() => {
      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.returnTab) {
        const currentTab = this.route.snapshot.queryParams['returnTab'];
        this.profileTabs.selectedIndex = currentTab; 
      }
    });
  }

    // tslint:disable-next-line:typedef
  onScroll() {
    if (this.loading) {
        return;
    }
    this.loading = false;
    this.isScrolled = true;
    this.getPostsByTab();
    this.isScrolled = false;
  }

    // tslint:disable-next-line:typedef
  private loadUserInfo(userId) {
    this.userService.getById(userId).subscribe((data) => {
      if (data.success === 1) {
        this.user = data.data;

        // get is followed
          // tslint:disable-next-line:no-shadowed-variable
        this.friendService.isFollowed(this.user.id).subscribe(( data: any ) => {
          if (data && data['success']) {
            this.isFollowed = data.data.isFollowed;
          }
        });

        this.getPostsByTab();
      }
    });
  }

  // private loadUserInfoByUsername(username: string) {
  //   this.userService.getByUsername(username).pipe(first()).subscribe((data) => {
  //     console.log('user => ', data);
  //     if (data.success == 1) {
  //       this.user = data.data;
  //       this.loadPostsByUser();
  //     }
  //   });
  // }

    // tslint:disable-next-line:typedef
  private loadPostsByUser() {
    this.loading = true;
    if (!this.isScrolled) {
      this.posts = [];
    }
    this._postService.getPopulatesByUser(this.user.id, this.currentSort, this.posts.length, this.loadsAtOnce).subscribe((data) => {
      if (data && data['success'] === 1) {
        for (const post of data.data.post) {
          post.showComment = false;
          post.showEmoji = false;
          this.posts.push(post);
        }
      }
      this.loading = false;
    },
      (error) => {
        this.loading = false;
      });
  }

    // tslint:disable-next-line:typedef
  private loadLikePosts() {
    if (!this.isScrolled) {
      this.loading = true;
      this.posts = [];

      this.likeService.getByUserAndSort(this.user.id, this.currentSort, this.posts.length, this.loadsAtOnce).subscribe((data) => {
        if (data && data['success'] === 1) {
          for (const likePost of data['data']) {
              // tslint:disable-next-line:variable-name
            const like_list = likePost;
            like_list.showComment = false;
            like_list.showEmoji = false;
            like_list.owner = likePost.owner;
            this.posts.push(like_list);
          }
        }
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
    }
  }

    // tslint:disable-next-line:typedef
  private loadBookmarkPosts() {
    if (!this.isScrolled) {
      this.loading = true;
      this.posts = [];
      this.bookmarkService.getByUser(this.user.id).subscribe((data) => {
        if (data && data['success'] === 1) {
          for (const bookmark of data['data']) {
              // tslint:disable-next-line:variable-name
            const bookmark_list = bookmark;
            bookmark_list.showComment = false;
            bookmark_list.showEmoji = false;
            bookmark_list.owner = bookmark.owner;
            this.posts.push(bookmark_list);
          }
        }
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
    }
  }

    // tslint:disable-next-line:typedef
  onFollowClicked() {
    if (this.following_state){
        return false;
    }
    const following = this.user.id;
      // tslint:disable-next-line:variable-name
    let dialog_exist = null;
    this.user.followFee = this.user.followFee ? this.user.followFee : 0;
    if (this.user.followFee > 0){
        dialog_exist = this.dialog.open(ConfirmMessageComponent,
            {data:
                    {
                        confirmMessage: 'When following this user you will be charged ' + this.user.followFee + ' Nudles each month until you unfollow them.',
                        confirm1: 'Please confirm that you wish to follow ' +  this.user.username,
                    }
            });
    }
    if (dialog_exist === null){
        this.processFollow(following , this.user.followFee);
    }
    else {
        dialog_exist.afterClosed().subscribe(result => {
            if (result) {
                this.processFollow(following, this.user.followFee);
            }
            dialog_exist = null;
        });
    }
  }

    // tslint:disable-next-line:typedef
  private processFollow(followId , followfee){
      this.following_state = true;
      this.friendService.followUser(followId , followfee).subscribe((data) => {
          if (data && data['success'] === 1) {
              this.isFollowed = true;
              this.user.followers_count ++;
              if (data['data'].fuser.followFee > 0){
                  this.posts = this.posts.filter(item => {
                      if (!item.blur){
                          item.blur = false;
                      }
                      return item;
                  });
              }
              if (data['data'].credit_balance >= 0) {
                  this.uservice.balance.next(data['data'].credit_balance);
              }
          }
          else{
              this.toastr.error(data['error'], 'Following Error', {
                  progressBar: true,
                  timeOut: 5000,
                  enableHtml: true
              });

          }
          this.following_state = false;
      }, (error) => {
          this.following_state = false;
      });
  }

    // tslint:disable-next-line:typedef
  onUnfollowClicked() {
      if (this.following_state){
          return false;
      }
      const following = this.user.id;
      this.following_state = true;
      this.friendService.unfollowUser(following).subscribe((data) => {
      if (data && data['success'] === 1) {
        this.isFollowed = false;
        this.user.followers_count --;
        this.posts = this.posts.filter(item => {
            if (item.fee > 0 && item.owner._id !== this.currentUser.id) {
                item.blur = true;
            }

            return item;
        });
      }
      this.following_state = false;
    }, (error) => {
        this.following_state = false;
    });
  }

  onAddImage(id): void {
    this.router.navigate(['post']);
  }

  onTabChange(event): void {
    switch (event.index) {
      case 0:
        this.currentTab = 0;
        this.loadPostsByUser();
        break;
      case 1:
        this.currentTab = 1;
        this.loadPostsByUser();
        break;
      case 2:
        this.currentTab = 2;
        this.loadLikePosts();
        break;
      case 3:
        this.currentTab = 3;
        this.loadBookmarkPosts();
        break;
      case 4:
        this.currentTab = 4;
        if (!this.isMine) {
            this.userService.updateChatByUserId(this.user.id).pipe(takeUntil(this._unsubscribeAll)).subscribe((data: any) => {
                if (data.success === 1){
                    this.chatService.getChat(data.data, true);
                    const newMsg = this._matDialog.open(ChatViewComponent, {width: '500px', height: '90%'});
                    newMsg.afterClosed().subscribe(() => {
                        this.profileTabs.selectedIndex = 0;
                    });
                }
            });

        }

        break;
    }

    this.returnParams['returnTab'] = this.currentTab;
  }

    // tslint:disable-next-line:typedef
  onMostActiveClicked() {
    this.currentSort = 'ma';
    this.getPostsByTab();
  }

    // tslint:disable-next-line:typedef
  onNewestPostClicked() {
    this.currentSort = 'np';
    this.getPostsByTab();
  }

    // tslint:disable-next-line:typedef
  getPostsByTab() {
    switch (this.currentTab) {
      case 0:
      case 1:
        this.loadPostsByUser();
        break;
      case 2:
        this.loadLikePosts();
        break;
      case 3:
        this.loadBookmarkPosts();
        break;
    }
  }

  onFileInput(type: number, file, event): void {
    if (type === 0) {
      this.avatarChangedEvent = event;

      const dialogRef = this.dialog.open(this.avatarCropDialog);
      dialogRef.afterClosed().subscribe(result => {
        // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
        if (result !== undefined) {
          if (result === 'yes') {
            // TODO: Replace the following line with your code.
            console.log('User clicked yes.');
          } else if (result === 'no') {
            // TODO: Replace the following line with your code.
            console.log('User clicked no.');
          }
        }
      });
    }

    const url = URL.createObjectURL(file);
    this.photos.push(file);
    if (type === 0) {
    }
  }

    // tslint:disable-next-line:typedef
  onAvatarCropped(event: ImageCroppedEvent) {
    this.avatarCroppedImage = event.base64;
  }
    // tslint:disable-next-line:typedef
  onAvatarLoaded(/*image: HTMLImageElement*/) {
    // show cropper
  }
    // tslint:disable-next-line:typedef
  onAvatarCropperReady() {
    // cropper ready
  }
    // tslint:disable-next-line:typedef
  onAvatarLoadFailed() {
    // show message
  }
    // tslint:disable-next-line:typedef
  checkBlurPost(obj, followObject){
    if (obj.fee > 0 && obj.owner._id !== this.currentUser.id){
        obj.blur = true;
    }
    else {
        obj.blur = false;
    }
    if (obj.blur && followObject.follow){
        // tslint:disable-next-line:variable-name
        const follow_filter = followObject.follow.filter(item => {
            if (item.followee._id === this.user.id && item.status) {
                return item;
            }
        });
        if (follow_filter.length > 0) {
            obj.blur = false;
        }
    }
    if (obj.blur && followObject.purchased) {
        // tslint:disable-next-line:variable-name
        const purchase_filter = followObject.purchased.filter(item => {
           if (item.buyer === this.currentUser.id && item.post === obj._id){
              return item;
           }
        });
        if (purchase_filter.length > 0) {
            obj.blur = false;
        }
    }
    return obj;
  }

    // tslint:disable-next-line:typedef
    goFollow(param: number) {
      if (!this.isMine) {
        return;
      }
      const newMsg = this._matDialog.open(FollowingComponent, {width: '350px', height: '450px', data: param});
      newMsg.afterClosed().subscribe((data) => {

      });
    }
}
