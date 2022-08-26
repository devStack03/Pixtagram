import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { FriendService } from 'app/shared/services/friend/friend.service';

@Component({
    selector   : 'app-share-dialog',
    templateUrl: './share-dialog.component.html',
    styleUrls  : ['./share-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShareDialogComponent
{

    public post: any;
    /**
     * Constructor
     *
     * @param {MatDialogRef<ShareDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<ShareDialogComponent>,
    )
    {
        
    }

    sharefacebook() {
        this.dialogRef.close();
    }

    shareMessenger() {
        this.dialogRef.close();
    }

    shareTwitter() {
        this.dialogRef.close();
    }

    shareEmail() {
        this.dialogRef.close();
    }

    copyLink() {
        this.dialogRef.close();
    }

}
