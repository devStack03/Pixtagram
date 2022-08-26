import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'app-chat-left-sidenav',
  templateUrl: './chat-left-sidenav.component.html',
  styleUrls: ['./chat-left-sidenav.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatLeftSidenavComponent implements OnInit, OnDestroy{


    view: string;
    constructor() {
        this.view = 'chats';
    }

  ngOnInit(): void {
  }

    ngOnDestroy(): void {
    }

}
