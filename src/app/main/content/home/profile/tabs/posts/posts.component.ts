import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';

import { PostService } from 'app/shared/services/post/post.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppConstants } from 'app/shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationStart, ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../../../../../shared/services/user.service';

@Component({
    selector: 'profile-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProfilePostsComponent implements OnInit, OnDestroy {

    @Input() posts: any[];
    @Input() user: any;
    @Input() loading = true;
    @Input() returnParams: any = {};
    @Input() currentUser: any;

    loadsAtOnce = 12;

    avatarCroppedImage: any = 'assets/images/avatars/profile.jpg';

    @ViewChild('socialShareDialog') socialShareDialog;

    public dialogRef: MatDialogRef<ProfilePostsComponent>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ProfileService} _postService
     */
    constructor(
        private _postService: PostService,
        private authService: AuthService,
        private _matDialog: MatDialog,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        private userService: UserService
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

    // tslint:disable-next-line:typedef
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

    // tslint:disable-next-line:typedef
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
