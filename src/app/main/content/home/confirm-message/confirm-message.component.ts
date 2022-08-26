import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-confirm-message',
  templateUrl: './confirm-message.component.html',
  styleUrls: ['./confirm-message.component.scss']
})
export class ConfirmMessageComponent implements OnInit{
    mediaForm: FormGroup;
    public feeVal = 0;
    constructor(
                public dialogRef: MatDialogRef<ConfirmMessageComponent>,
                private formBuilder: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data
                ) {
    }

    ngOnInit() {
        this.mediaForm = this.formBuilder.group({
            fee: [0],
        });
    }

    confrim() {
        if(this.data.follow){
            this.dialogRef.close({fee: this.feeVal})
        }
        else{
            this.dialogRef.close(true)
        }

    }
}
