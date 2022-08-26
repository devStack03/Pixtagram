import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { S3UploaderService } from '../../../../shared/services/aws/s3-uploader.service';
import { ChatService } from '../../../../shared/services/chat/chat.service';
import {FuncsService} from '../../../../shared/services/funcs/funcs.service';
import { AppConstants } from '../../../../shared/constants';
import * as moment from 'moment';

@Component({
  selector: 'app-message-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class RoomComponent implements OnInit {

  user: any;
  rooms: any[] = [];

  loading = true;
  loadsAtOnce = 10;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uploaderService: S3UploaderService,
    private chatService: ChatService,
    private funcsService: FuncsService
  ) {

    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.loadRooms();
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {
  }

    // tslint:disable-next-line:typedef
  onScroll() {
    if (this.loading) {
       return;
    }
    this.loading = true;
    this.loadRooms();
  }

    // tslint:disable-next-line:typedef
  loadRooms() {
    this.loading = true;
    this.chatService.getRoomswithScroll(this.rooms.length, this.loadsAtOnce).subscribe((res) => {

      if (res && res.success === 1) {
        for (const room of res.data) {

          if (room.participant1._id === this.user.id) {
            room.receiver = room.participant2;
          } else {
            room.receiver = room.participant1;
          }

          this.rooms.push(room);
        }

      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
    });
  }

  formatFromNow(value) {
    return moment(value).fromNow();
  }

  formatPeriod(value) {
    return this.funcsService.formatPeriod(value);
  }

  onRoomClicked(room) {
    const chatRoom = {};
    chatRoom['receiver'] = room.receiver;
    chatRoom['new'] = false;
    sessionStorage.setItem(AppConstants.chatRoom, JSON.stringify(chatRoom));
    this.router.navigate(['/chat/' + room.id]);
  }

    // tslint:disable-next-line:typedef
  onLongPressed() {
        
  }
}
