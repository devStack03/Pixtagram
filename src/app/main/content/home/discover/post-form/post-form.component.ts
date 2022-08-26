import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { CalendarEvent } from 'angular-calendar';

import { PostService } from 'app/shared/services/post/post.service';
import { UserService } from 'app/shared/services/user/user.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { FriendService } from 'app/shared/services/friend/friend.service';
import { CommentService } from 'app/shared/services/comment/comment.service';


@Component({
    selector     : 'app-post-form-dialog',
    templateUrl  : './post-form.component.html',
    styleUrls    : ['./post-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

// tslint:disable-next-line:component-class-suffix
export class PostFormDialogCompent  implements OnInit
{
    event: CalendarEvent;
    dialogTitle: string;
    contactForm: FormGroup;
    post: any;
    user: any;
    commentloading: boolean;
    postIndex: number;
    postCount: number;
    search: string;

    constructor(
        public dialog: MatDialog,
        private postService: PostService,
        private userService: UserService,
        private likeService: LikeService,
        private commentService: CommentService,
        private friendService: FriendService,
        public dialogRef: MatDialogRef<PostFormDialogCompent>,
        @Inject(MAT_DIALOG_DATA) private data: any
    )
    {
        this.commentloading = false;
        this.post = data.post;
        this.postIndex = data.index;
        this.postCount = data.postCount;
        this.search = data.search;
        
    }

    // tslint:disable-next-line:typedef
    ngOnInit() {
        // this.commentloading = false;
        // this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        // this.post.owner.isUpdating = false;
        // this.post.owner.isFollowing = true;
        // this.loadMoreComments();
        // this.showImage() ;
        //
        
    }
    // protected highlight(text) {
    //     return text.replace(/(^|\s)(#[a-z\d-]+)/ig, "$1<a class='hash-tag'>$2</a>");
    // }
    //
    // protected loadMoreComments() {
    //     if ( this.post.comments.length >= this.post.commentCount )
    //         return;
    //     this.commentService.loadComments(this.post._id, this.post.comments.length).subscribe((res)=>{
    //         if ( res.success == 1 ) {
    //             for ( let comment of res.data.comments)
    //                 this.post.comments.push( comment );
    //             this.post.commentCount = res.data.total;
    //         }
    //         this.commentloading = false;
    //         const commentsContainer = document.querySelector('#comments-container');
    //         if ( commentsContainer ) {
    //             commentsContainer.addEventListener('ps-y-reach-end', () => {
    //                 this.loadMoreComments();
    //             });
    //         }
    //
    //
    //     });
    // }
    //
    // protected displayTime(tm) {
    //     return "1 day ago";
    // }
    //
    // protected likePost(post) {
    //     post.myLiked = !post.myLiked;
    //     this.likeService.create(post).subscribe((data) => {
    //         if (data.success != 1) {
    //             post.myLiked = !post.myLiked;
    //         }
    //     });
    // }
    //
    // protected likeComment(comment) {
    //     comment.myLiked = !comment.myLiked;
    //     this.likeService.create(comment).subscribe((data) => {
    //         if (data.success != 1) {
    //             comment.myLiked = !comment.myLiked;
    //         }
    //     });
    // }
    //
    // protected commentPost(commentTxtAreaInput, post) {
    //     console.log(commentTxtAreaInput);
    //     commentTxtAreaInput.focus();
    // }
    //
    // protected bookmarkPost(post) {
    //     post.bookmark = !post.bookmark;
    //     this.postService.bookmark(post).subscribe((data) => {
    //         if (data.success != 1) {
    //             post.bookmark = !post.bookmark;
    //         }
    //     });
    // }
    //
    // protected addComment(commentTxtAreaInput, post) {
    //     const comment = commentTxtAreaInput.value;
    //     if (comment.length > 0) {
    //
    //         this.commentService.create(post, comment).subscribe((data) => {
    //
    //             if (data.success == 1) {
    //                 let commentObj = data.data;
    //                 commentObj['commenter'] = {
    //                     username: this.user.username,
    //                     _id: this.user.id
    //                 };
    //                 console.log(this.user);
    //                 post.comments.unshift(commentObj);
    //                 commentTxtAreaInput.value = '';
    //                 commentTxtAreaInput.blur();
    //             }
    //         });
    //     }
    // }
    //
    // protected onFollow(user) {
    //     console.log('follow user: ' + user._id);
    //     user.isUpdating = true;
    //     this.friendService.follow(user._id).subscribe((res) => {
    //         if (res.success == 1) {
    //             user.isFollowing = true;
    //         }
    //         user.isUpdating = false;
    //     });
    // }
    //
    // protected populateMove(direction) {
    //     this.postService.getPopulateMove(this.post._id, direction, this.search).subscribe( (res) => {
    //         if ( res.success == 1 ) {
    //             this.post = res.data.post;
    //             this.postIndex = res.data.index;
    //             this.postCount = res.data.count;
    //             this.loadMoreComments();
    //             this.showImage();
    //         }
    //     });
    // }
    //
    // protected onLoadImage( event) {
    //     console.log(event);
    //
    // }
    //
    // protected showImage() {
    //
    //     var photo_size = 500;
    //     var img = new Image();
    //     img.onload = function () {
    //         var canvas = <HTMLCanvasElement>document.querySelector('#canvas');
    //         var photo_size = canvas.clientWidth;
    //         var width = img.width;
    //         var height = img.height;
    //
    //         if ( width > height )
    //         {
    //             height = height * photo_size / width;
    //             width = photo_size;
    //
    //         }
    //         else
    //         {
    //             width = width * photo_size / height;
    //             height = photo_size;
    //         }
    //
    //         canvas.getContext("2d").clearRect(0,0,photo_size,photo_size);
    //         canvas.getContext("2d").drawImage(img, (photo_size - width) / 2, (photo_size - height)/2, width, height);
    //     };
    //     img.src = this.post.media ? this.post.media : 'assets/images/etc/mountain-lake.jpg';
    // }
    //
    // protected sharePost(post) {
    //     var dialogRef = this.dialog.open(ShareDialogComponent, {
    //         panelClass: 'share-dialog',
    //     });
    //     this.dialogRef.componentInstance.post = post;
    //     dialogRef.afterClosed().subscribe(result => {
    //
    //     });
    // }

}
