import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { FriendService } from 'app/shared/services/friend/friend.service';

@Component({
    selector   : 'app-unfollow-dialog',
    templateUrl: './unfollow-dialog.component.html',
    styleUrls  : ['./unfollow-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UnfollowDialogComponent
{
    user : any;

    /**
     * Constructor
     *
     * @param {MatDialogRef<UnfollowDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<UnfollowDialogComponent>,
        private friendService: FriendService,
        @Inject(MAT_DIALOG_DATA) private data: any
    )
    {
        this.user = data.user;
    }

}
