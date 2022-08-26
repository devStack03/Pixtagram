import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-chat-user-sidenav-component',
  templateUrl: './chat-user-sidenav-component.component.html',
  styleUrls: ['./chat-user-sidenav-component.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatUserSidenavComponentComponent implements OnInit, OnDestroy{

    user: any;
    userForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void
    {

    }

    changeLeftSidenavView(view): void
    {

    }

}
