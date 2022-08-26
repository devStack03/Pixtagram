import { Component, ViewChild, ViewChildren, OnInit, QueryList, AfterViewInit, ElementRef, HostListener, ViewEncapsulation, Renderer2, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { UserService} from '../../../../shared/services/user.service';
declare var $: any;
import { AppConfig } from '../../../../shared/config';
import { PostService } from '../../../../shared/services/post/post.service';
import { LikeService } from '../../../../shared/services/like/like.service';
import { CommentService } from '../../../../shared/services/comment/comment.service';
import { AppConstants } from '../../../../shared/constants';
import { FuseConfigService } from '@fuse/services/config.service';
import { ProfileFeedComponent } from '../profile/tabs/feed/feed.component';
import {SocketService} from '../../../../shared/services/socket.service';
import {Subject, interval as observableInterval} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  
})
export class FeedComponent implements OnInit, OnDestroy {

  appConfig = AppConfig;
  posts = [];
  loading = true;
  currentPageIndex = 0;
  commentsPerPage = 5;
  postsPerPage = 20;
  startcount = 0;
    // tslint:disable-next-line:variable-name
  showing_delete = true;
  isPostsLoading = false;
  moreItemsExist = true;
  user: any;
  returnParams: any = {'returnUrl': ''};
  realtimePosts = [];
  followslst: any;
  @ViewChildren('commentTxtAreaInput') commentTxtAreaInputList: QueryList<any>;
  @ViewChild('viewAllPosts') viewAllPosts: ProfileFeedComponent;
  private _unsubscribeAll: Subject<any>;
  constructor(
    private fuseConfig: FuseConfigService,
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private renderer: Renderer2,
    private userService: UserService,
    private socketService: SocketService,
    public elementRef: ElementRef
  ) {
      this._unsubscribeAll = new Subject();
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.loadAllPosts();
    // this.socketService.newPostNotification().pipe(takeUntil(this._unsubscribeAll)).subscribe((post) => {
    //     if (post.fee > 0 && post.owner._id !== this.user.id) {
    //         post.blur = true;
    //     }
    //     else {
    //         post.blur = false;
    //     }
    //     if (this.followslst.follow && post.blur) {
    //         // tslint:disable-next-line:variable-name
    //         const follow_length = this.followslst.follow.filter((item) => {
    //             if (item.followee._id === post.owner._id) {
    //                 return item;
    //             }
    //         });
    //         if (follow_length.length > 0) {
    //             post.blur = false;
    //         }
    //     }
    //     post.showComment = false;
    //     post.showEmoji = false;
    //     this.realtimePosts.unshift(post);
    // });
  }

    // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

    // tslint:disable-next-line:typedef
  onScroll() {
      // tslint:disable-next-line:no-conditional-assignment
    if (this.loading) {
        return;
    }
    this.loading = true;
    this.loadAllPosts();
  }
  /**
   * loadPosts
   */
  // tslint:disable-next-line:typedef
  private loadAllPosts() {
    this.loading = true;
    this.postService.getAllwithScroll(this.startcount, this.postsPerPage).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {

      if (data && data['success'] === 1) {
          this.startcount += this.postsPerPage;
          for (const post of data.data.post) {
            post.showComment = false;
            post.showEmoji = false;
            if (this.userService.sfw.getValue() === 'y'){
               post.type = 2;
               post.media = 'assets/images/55685.jpg';
            }
            this.posts.push(post);
        }
      }
      this.loading = false;
    },
      (error) => {
        this.loading = false;
      });
  }
  /**
   * highlight 
   */
  // tslint:disable-next-line:typedef
  protected highlight(text) {
    return text.replace(/(^|\s)(#[a-z\d-]+)/ig, '$1<a class=\'hash-tag\'>$2</a>');
  }


  /**
   * Load more Comments
   */
  // tslint:disable-next-line:typedef
  protected loadMoreComments(post) {
    console.log(post.comments.length);
  }

  /**
   * Like Post
   * @param post : Target post
   */
  // tslint:disable-next-line:typedef
  protected likePost(post) {
    post.myLiked = !post.myLiked;
    this.likeService.create(post).subscribe((data) => {
      if (data.success !== 1) {
        post.myLiked = !post.myLiked;
      }
    });
  }

    // tslint:disable-next-line:typedef
  protected commentPost(commentTxtAreaInput, post) {
    console.log(commentTxtAreaInput);
    commentTxtAreaInput.focus();
  }

    // tslint:disable-next-line:typedef
  protected addComment(commentTxtAreaInput, post) {
    const comment = commentTxtAreaInput.value;
    if (comment.length > 0) {
          
      this.commentService.create(post, comment).subscribe((data) => {

        if (data.success === 1) {
          const commentObj = data.data;
          commentObj['commenter'] = {
            username: this.user.username,
            _id: this.user.id
          };

          post.comments.push(commentObj);
          commentTxtAreaInput.value = '';
          commentTxtAreaInput.blur();
        }
      });
    }
  }

    // tslint:disable-next-line:typedef
    viewNewPost(el) {
        // this.posts  = this.realtimePosts.concat(this.posts);
        // this.realtimePosts = [];
        this.scrollToTop();
    }

    scrollToTop() {
        // tslint:disable-next-line:no-debugger
    }
}
