import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { UserService } from 'app/shared/services/user/user.service';

@Component({
    selector: 'search-lists',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class SearchComponent {
    searchInput: FormControl;

    searchTerm: string;

    users: any[] = [];
    selectedUser: any = null;

    loading = true;
    loadsAtOnce = 15;
    isSearching = false;

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private userService: UserService,
        private router: Router,
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
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.loadUsers();
    }

    // tslint:disable-next-line:typedef
    loadUsers() {
        this.loading = true;
        this.userService.getBySearchWithUsername(this.searchTerm, this.users.length, this.loadsAtOnce).subscribe((res) => {
            if (res.success === 1) {
                for (const user of res.data.user) {
                    this.users.push(user);
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

    onUserClicked(user) {
        this.router.navigate(['/users/' + user._id]);
    }

    onLongPressed() {

    }
}
