import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import {Router } from '@angular/router';
import { UserService } from 'app/shared/services/user/user.service';
import { ChatService } from 'app/shared/services/chat/chat.service';
import {FuncsService} from '../../../../shared/services/funcs/funcs.service';

@Component({
  selector: 'app-notification-list-component',
  templateUrl: './notification-list-component.component.html',
  styleUrls: ['./notification-list-component.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class NotificationListComponent {

    searchInput: FormControl;
    searchTerm: string;
    users: any[] = [];
    selectedUser: any = null;
    loading = true;
    loadsAtOnce = 10;
    isSearching = false;

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private userService: UserService,
        private router: Router,
        private chatService: ChatService,
        private funcsService: FuncsService
    ) {
        // Set the defaults
        this.searchInput = new FormControl('');
        this.searchInput.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchText => {
            this.users = [];
            this.searchTerm = searchText;
            if (this.searchTerm && this.searchTerm.length > 0) {
                this.isSearching = true;
            }
            else {
                this.isSearching = false;
            }

            this.loadUsers();
        });

    }

    // tslint:disable-next-line:typedef
    onScroll() {
        this.loadUsers();
    }

    // tslint:disable-next-line:typedef
    formatPeriod(value) {
        return this.funcsService.formatPeriod(value);
    }

    // tslint:disable-next-line:typedef
    loadUsers() {
        this.loading = true;
        this.chatService.getNotification({from: this.users.length,  to: this.loadsAtOnce}).subscribe((res) => {

            if (res.success === 1) {
                for (const inv of res.data)
                {
                    let m = '';
                    if (inv.type === 1){
                        m = inv.sender.username + ' like your post';
                    }
                    else if (inv.type === 2){
                        m = inv.sender.username + ' bookmarked to your post';
                    }
                    else if (inv.type === 4){
                        m = inv.sender.username + ' liked your comment';
                    }
                    else {
                        m = inv.sender.username + ' added the comment to your post';
                    }

                    this.users.push({
                        msg: m,
                        createdAt: inv.createdAt,
                        username: inv.sender.username,
                        _id: inv.sender._id,
                        avatar: inv.sender.avatar ? inv.sender.avatar : '/assets/images/avatars/Velazquez.jpg',
                        postId: inv.postId
                    });
                }
            }
            this.loading = false;
        }, (error) => {
            this.loading = false;
        });
    }

    // tslint:disable-next-line:typedef
    formatFromNow(value) {
        return this.funcsService.formatFromNow(value);
    }

    // tslint:disable-next-line:typedef
    onUserClicked(id) {
        this.router.navigate(['/view-post/' + id]);
    }

    // tslint:disable-next-line:typedef
    onLongPressed() {

    }

}
