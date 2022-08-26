import { Component, OnInit, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { Router, NavigationStart, ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-notify-component',
  templateUrl: './notify-component.component.html',
  styleUrls: ['./notify-component.component.scss']
})
export class NotifyComponentComponent implements OnInit {

    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        private router: Router
        ) { }

  ngOnInit(): void {
  }
  onPostClicked(id= '') {
     this.router.navigate(['view-post', id], { queryParams: {} } );
  }
}
