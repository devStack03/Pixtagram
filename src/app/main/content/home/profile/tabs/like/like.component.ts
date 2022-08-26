import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';

import { PostService } from 'app/shared/services/post/post.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { BookmarkService } from 'app/shared/services/bookmark/bookmark.service';
import { CommentService } from 'app/shared/services/comment/comment.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router} from '@angular/router';
import {UserService} from '../../../../../../shared/services/user.service';
import {FuncsService} from '../../../../../../shared/services/funcs/funcs.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {SocketService} from '../../../../../../shared/services/socket.service';

@Component({
  selector: 'profile-likes',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProfileLikesComponent implements OnInit, OnDestroy {

  @ViewChild('MoreMenuDialog') moreMenuDialog;
  @ViewChild('commentTxtAreaInput') commentTxtAreaInput;
  @ViewChild('socialShareDialog') socialShareDialog;

  @Input() posts: any[];
  @Input() user: any;
  @Input() currentUser: any;
  @Input() loading = true;
  @Input() returnParams: any = {};

  loadsAtOnce = 12;

  public dialogRef: MatDialogRef<ProfileLikesComponent>;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {PostService} _postService
   */
  constructor(
    private _postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private bookmarkService: BookmarkService,
    private _matDialog: MatDialog,
    private router: Router,
    private _matSnackBar: MatSnackBar,
    private userService: UserService,
    private funcsService: FuncsService,
    private socketService: SocketService
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
  }


  protected highlight(text) {
    if (!text) {
      return text;
    }
    return text.replace(/(^|\s)(#[a-z\d-]+)/ig, '$1<a class=\'hash-tag\'>$2</a>');
  }


  protected loadMoreComments(post) {

    this.commentService.loadComments(post._id, post.comments.length).subscribe((data) => {
        // tslint:disable-next-line:no-conditional-assignment
      if (data.success = 1) {
        post.commentCount = data.data.total;
        for (let index = data.data.comments.length - 1; index >= 0; index--) {
          post.comments.push(data.data.comments[index]);
        }
      }
    });
  }

  protected viewCommentDetail(comment) {
    comment.isdetail = true;
  }

  /**
   * Like Post
   * @param post : Target post
   */
  protected likePost(post) {

    post.myLiked = !post.myLiked;

    const old = post.likeCount;
    if (post.myLiked) {
      post.likeCount += 1;
    }
    else {
      post.likeCount -= 1;
    }

    this.likeService.create(post).subscribe((data) => {
      if (data.success !== 1) {
        post.myLiked = !post.myLiked;
        post.likeCount = old;
      }
    },
      (err: any) => {
        post.myLiked = !post.myLiked;
        post.likeCount = old;
      });
  }

    // tslint:disable-next-line:typedef
  protected likeComment(comment) {
    comment.myLiked = !comment.myLiked;
    comment.ctype = 'comment';
    this.likeService.createComment(comment).subscribe((data) => {
      if (data.success === 1) {
        if (comment.myLiked){
          this.socketService.addLikeComment({
              id: comment.post,
              owner: comment.commenter._id,
              username: this.currentUser.username,
              _id: this.currentUser.id,
              createdAt: Date.now(),
              avatar: this.currentUser?.avatar ? this.currentUser.avatar : 'assets/images/avatars/katherine.jpg'
          });
        }
      }
    },
      (err: any) => {
        comment.myLiked = !comment.myLiked;
      });
  }

  protected likeCommentInLikes(comment, comments) {
    if (!comments || comments.length === 0) {
      return;
    }

    this.likeService.createComment(comment).subscribe((data) => {
      if (data.success === 1) {
        comment.myLiked = !comment.myLiked;
          // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < comments.length; i++) {
          if (comments[i]._id === comment._id) {
            comments[i].myLiked = comment.myLiked;
          }
        }
      }
    });
  }

  protected commentPost(post) {
    post.showComment = !post.showComment;
  }

  protected addComment(commentTxtAreaInput, post) {
    const comment = commentTxtAreaInput.value;
    if (comment.length > 0) {

      this.commentService.create(post, comment).subscribe((data) => {

        if (data.success === 1) {
          const commentObj = data.data.comment;
          post.commentCount = data.data.count;
          commentObj['commenter'] = {
            username: this.user.username,
            _id: this.user.id,
            avatar: this.user.avatar
          };
          console.log(post);
          post.comments.unshift(commentObj);
          commentTxtAreaInput.value = '';
          commentTxtAreaInput.blur();
        }
      });
    }
  }

  onMoreClicked(post) {

    this.dialogRef = this._matDialog.open(this.moreMenuDialog, {
      panelClass: 'menu-form-dialog'
    });
    this.dialogRef.afterClosed().subscribe(result => {
      // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
      if (!result) {
        return;
      }

      const actionType: string = result[0];
      switch (actionType) {
        case 'Delete':
          this.onDeletePost(post);
          break;
        case 'Share':
          this.onShareClicked();

          break;
        case 'Copy':

          break;
        case 'Embed':

          break;
      }
    });
  }

  formatPeriod(value) {
    return this.funcsService.formatPeriod(value);
  }

  onBookmarkClicked(post) {
    post.bookmark = !post.bookmark;
    if (post.bookmark) {
      post.bookmarkCount += 1;
    }
    else {
      post.bookmarkCount -= 1;
    }

    this.bookmarkService.create(post).subscribe((data) => {
      if (data.success !== 1) {
        post.bookmark = !post.bookmark;
        post.bookmarkCount -= 1;
      }
    },
      (err: any) => {
        post.bookmark = !post.bookmark;
      });
  }

  onShareClicked() {
    this.dialogRef = this._matDialog.open(this.socialShareDialog);
    this.dialogRef.afterClosed().subscribe(result => {
      // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
      if (result !== undefined) {
        if (result === 'OK') {
          // TODO: Replace the following line with your code.
        } else if (result === 'no') {
          // TODO: Replace the following line with your code.
        }
      }
    });
  }

  onDeletePost(post) {
    this._postService.delete(post._id).subscribe((data) => {
      if (data && data['success'] === 1) {
        // should remove bookmark
        for (let i = 0; i < this.posts.length; i++) {
          if (this.posts[i]._id === post._id) {
            this.posts.splice(i, 1);  // remove the item
            break; // finish the loop, as we already found the item
          }
        }
      }
    });
  }

    // tslint:disable-next-line:typedef
  onPostClicked(post) {
    this.router.navigate(['view-post', post._id], { queryParams: this.returnParams } );
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

    // tslint:disable-next-line:typedef
    onPostPay(post: any) {
        if (post.fee <= 0) {
            post.blur = false;
        }
        else{
            post.loading = true;
            this.userService.transferBalance(post?.owner?._id, post._id, post.fee).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
                if (data['success'] === 1 && data['data'] && data['data'].purchaser && data['data'].balance) {
                    this.userService.balance.next(data['data'].balance);
                    this.router.navigate(['view-post', post._id], { queryParams: this.returnParams } );
                }
                else if (data['success'] === 0 && data['code'] === 1){
                    this._matSnackBar.open(data['error'], '' , {
                        verticalPosition: 'bottom',
                        politeness : 'assertive',
                        duration        : 1500
                    });
                    this.router.navigate(['view-post', post._id], { queryParams: this.returnParams } );
                }
                else if (data['success'] === 0 && data['data'] && data['data'].follower && data['code'] === 2){
                    this._matSnackBar.open(data['error'], '' , {
                        verticalPosition: 'bottom',
                        politeness : 'assertive',
                        duration        : 1500
                    });
                    const purchases = this.userService.followList.getValue();
                    purchases.purchased.push(data['data'].follower);
                    this.userService.followList.next(purchases);
                    this.router.navigate(['view-post', post._id], { queryParams: this.returnParams } );

                }
                else if (data['success'] === 0 && data['error']){
                    this._matSnackBar.open(data['error'], '' , {
                        verticalPosition: 'bottom',
                        politeness : 'assertive',
                        duration        : 1500
                    });
                }
                post.loading = false;
            } , (err) => {
                post.loading = false;
            });
        }
    }
}
