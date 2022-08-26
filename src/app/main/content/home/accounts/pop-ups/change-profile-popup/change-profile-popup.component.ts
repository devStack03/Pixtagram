import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-change-profile-popup',
  templateUrl: './change-profile-popup.component.html',
  styleUrls: ['./change-profile-popup.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ChangeProfilePopupComponent {

  tiles: Tile[] = [
    {text: 'Upload Photo', cols: 1, rows: 1, color: '#3897f0'},
    {text: 'Remove Current Photo', cols: 1, rows: 1, color: '#ed4956'},
    {text: 'Cancel', cols: 1, rows: 1, color: 'inherit'}
  ];
  constructor(
    public dialogRef: MatDialogRef<ChangeProfilePopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) { }

  ngOnInit() {
  }

  protected onClickTitle(index) {
    this.dialogRef.close(index);
  }
}
