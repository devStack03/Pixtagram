import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AppConstants} from '../../../../shared/constants';

@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss'],
  animations: fuseAnimations,
})
export class ReportDialogComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<ReportDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

}
