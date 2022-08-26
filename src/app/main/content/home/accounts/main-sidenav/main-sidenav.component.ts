import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-sidenav',
  templateUrl: './main-sidenav.component.html',
  styleUrls: ['./main-sidenav.component.scss']
})
export class MainSidenavComponent implements OnInit {

  lists: any[];
  constructor() {
    this.lists = [
      { id: 1, handle: 'edit', title: 'Edit Profile', icon: 'send' },
      { id: 2, handle: 'change-password', title: 'Change Password', icon: 'email_open' },
      { id: 3, handle: 'auth-apps', title: 'Authorized Applications', icon: 'error' },
      { id: 4, handle: 'email-sms', title: 'Email and SMS', icon: 'delete' },
      { id: 5, handle: 'manage-contacts', title: 'Manage Contacts', icon: 'delete' },
      { id: 6, handle: 'privacy', title: 'Privacy and Security', icon: 'delete' },
    ];
  }

  ngOnInit() {
  }

}
