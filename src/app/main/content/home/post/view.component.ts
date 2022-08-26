import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from 'app/shared/services/post/post.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { BookmarkService } from 'app/shared/services/bookmark/bookmark.service';
import { CommentService } from 'app/shared/services/comment/comment.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'app/shared/constants';
import { Subject } from 'rxjs';
import {SocketService} from '../../../../shared/services/socket.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {UserService} from '../../../../shared/services/user.service';
import {FuncsService} from '../../../../shared/services/funcs/funcs.service';

@Component({
  selector: 'view-post',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ViewPostComponent implements OnInit, OnDestroy {

  @ViewChild('MoreMenuDialog') moreMenuDialog;
  @ViewChild('commentTxtAreaInput') commentTxtAreaInput;
  @ViewChild('socialShareDialog') socialShareDialog;

  post: any = null;
  user: any = null;
  isMyPost = false;

  public dialogRef: MatDialogRef<ViewPostComponent>;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {PostService} _postService
   */
  constructor(
    private _matSnackBar: MatSnackBar,
    private fuseConfig: FuseConfigService,
    private _postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private bookmarkService: BookmarkService,
    private _matDialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private userService: UserService,
    private funcsService: FuncsService
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();

    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    if (!this.user) {
        this.fuseConfig.setConfig({
            layout: {
                toolbar: {hidden : true},
            }
        });
    }
    if (this.route.snapshot.params && this.route.snapshot.params.id) {
      this._postService.getById(this.route.snapshot.params.id).subscribe((data) => {
        if (data && data['success'] === 1) {
          this.post = data['data'];
          if (this.post.isDeleted) {
              this._matSnackBar.open('Post deleted by user', '', {
                  verticalPosition: 'top',
                  horizontalPosition: 'right',
                  politeness : 'assertive',
                  duration        : 3000
              });
              this.router.navigate(['/']);
              return;
          }
          if (this.userService.sfw.getValue() === 'y'){
              this.post.type = 2;
              this.post.media = 'assets/images/55685.jpg';
          }
          
          if (this.user != null) {
            if (this.post.owner && this.user.id === this.post.owner._id) {
              this.isMyPost = true;
            }
          }
        }
      });
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hookss
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
      if (data.success === 1) {
        post.commentCount = data.data.total;
        for (let index = data.data.comments.length - 1; index >= 0; index--) {
          post.comments.push(data.data.comments[index]);
        }

      }
    }, (err) => {
    });
  }

    // tslint:disable-next-line:typedef
  protected viewCommentDetail(comment) {
    comment.isdetail = true;
  }

  /**
   * Like Post
   * @param post : Target post
   */
  protected likePost(post) {
    if (!this.user) {
        this._matSnackBar.open('You need to Log In', '', {
            verticalPosition: 'top',
            horizontalPosition: 'right',
            politeness : 'assertive',
            duration        : 3000
        });
    }
    const old = post.likeCount;
    this.likeService.create(post).subscribe((data) => {
      if (data.success === 1) {
        post.myLiked = !post.myLiked;
        post.likeCount = old;
        if (post.myLiked) {
            post.likeCount += 1;
        }
        else {
            post.likeCount -= 1;
        }
      }
      if (post.myLiked) {
          this.socketService.sendLike(
              {
                  id: post._id,
                  like: post.myLiked,
                  owner: post.owner._id,
                  username: this.user.username,
                  _id: this.user.id,
                  createdAt: Date.now(),
                  avatar: this.user?.avatar ? this.user.avatar : 'assets/images/avatars/katherine.jpg'
              });
      }
    },
      (err: any) => {
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
                  username: this.user.username,
                  _id: this.user.id,
                  createdAt: Date.now(),
                  avatar: this.user?.avatar ? this.user.avatar : 'assets/images/avatars/katherine.jpg'
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
          this.socketService.addComment({
            id: post._id,
            owner: post.owner._id,
            username: this.user.username,
            _id: this.user.id,
            createdAt: Date.now(),
            avatar: this.user?.avatar ? this.user.avatar : 'assets/images/avatars/katherine.jpg'
        });
        }
        post.showComment  = !post.showComment;
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
        case 'Report':
          break;
        case 'Follow':
          break;
        case 'Copy':

          break;
        case 'Embed':

          break;
      }
    });
  }

    // tslint:disable-next-line:typedef
  formatPeriod(value) {
    return this.funcsService.formatPeriod(value);
  }

    // tslint:disable-next-line:typedef
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
      else{
          this.socketService.sendBookMark({
              id: post._id,
              bookmark: post.bookmark,
              owner: post.owner._id,
              username: this.user.username,
              _id: this.user.id,
              createdAt: Date.now(),
              avatar: this.user?.avatar ? this.user.avatar : 'assets/images/avatars/katherine.jpg'
          });
      }
    },
      (err: any) => {
        post.bookmark = !post.bookmark;
      });
  }

  onShareClicked() {
    console.log('share clicked');
    this.dialogRef = this._matDialog.open(this.socialShareDialog);
    this.dialogRef.afterClosed().subscribe(result => {
      // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
      if (result !== undefined) {
        if (result === 'OK') {
          // TODO: Replace the following line with your code.
          console.log('User clicked OK.');
        } else if (result === 'no') {
          // TODO: Replace the following line with your code.
          console.log('User clicked no.');
        }
      }
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
