import {Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {FuncsService} from '../../../../shared/services/funcs/funcs.service';
import {UserService} from '../../../../shared/services/user.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Subject} from 'rxjs';
import {AppConstants} from '../../../../shared/constants';
import {MatTabGroup} from "@angular/material/tabs";

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TransactionComponent implements OnInit, OnDestroy {
    param_selected = [];
    selected = [];
    rows: any[];
    loadingIndicator: boolean;
    reorderable: boolean;
    searchInput: FormControl;
    searchTerm: string;
    trans: any[] = [];
    selectedUser: any = null;
    loading = true;
    loadsAtOnce = 600;
    isSearching = false;
    user: any;
    income: any[] = [];
    outcome: any[] = [];
    type = 'income'
    private _unsubscribeAll: Subject<any>;
    @ViewChild('profileTabs') profileTabs: MatTabGroup;
    constructor(
        private funcsService: FuncsService,
        private userService: UserService
    ) {
        // this.searchInput = new FormControl('');
        // this.searchInput.valueChanges.pipe(
        //     debounceTime(500),
        //     distinctUntilChanged()
        // ).subscribe(searchText => {
        //     this.trans = [];
        //     this.searchTerm = searchText;
        //     if (this.searchTerm && this.searchTerm.length > 0) {
        //         this.isSearching = true;
        //     }
        //     else {
        //         this.isSearching = false;
        //     }
        //
        //     this.loadTrans();
        // });
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.loadTrans();
        this.user =  JSON.parse(localStorage.getItem(AppConstants.currentUser));
    }
    // tslint:disable-next-line:typedef
    onScroll() {
        this.loadTrans();
    }

    // tslint:disable-next-line:typedef
    private loadTrans() {
        this.loading = true;
        let tempTrans = [];
        if( (this.type == 'income' && this.income.length == 0) || this.type == 'outcome' && this.outcome.length == 0)
        {
            this.userService.getTrans({from: 0,  to: this.loadsAtOnce, type: this.type}).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
                if (res.success === 1) {
                    for (const inv of res.data){
                        let fee = inv.fee;
                        let avatar = '';
                        let avatarLink = '';
                        let messageContent = 'followed';
                        let messageHeader = 'You';
                        let messageEnd = 'You';
                        let from = inv.from.username;
                        if (inv.type === 'post') {
                            messageContent = 'viewed';
                            if (inv.post.type === 2){
                                avatar = inv.post.media;
                                avatarLink = 'view-post/' + inv.post._id;
                            }
                        }
                        let messageHeaderLink = null;
                        let messageEndLink = null;
                        if (inv.from._id === this.user.id){
                            if (inv.type === 'post'){
                                messageEnd = inv.to.username + '\'' + ' post';
                                messageEndLink = '/view-post/' + inv.post._id;
                            }
                            if (inv.type === 'message'){
                                messageHeader = 'You';
                                messageHeaderLink = '#';
                                messageContent = 'viewed';
                                messageEnd = inv.to.username + '\'' + ' message';
                                messageEndLink = 'javascript:void(0)';
                            }
                            else if(inv.type !== 'post' && inv.type !== 'message'){
                                messageEnd = inv.to.username;
                                avatarLink = messageEndLink = '/users/' + inv.to._id;
                                avatar = inv.to.avatar;
                            }
                        }
                        else{
                            messageHeader = inv.from.username;
                            messageHeaderLink = '/users/' + inv.from._id;
                            if (inv.type === 'post'){
                                messageEnd = 'your post';
                                messageEndLink = '/view-post/' + inv.post._id;
                            }
                            if (inv.type === 'message'){
                                messageContent = 'viewed';
                                messageEnd = 'your message';
                                messageEndLink = 'javascript:void(0)';
                            }
                            else if(inv.type !== 'post' && inv.type !== 'message'){
                                messageEnd = 'you';
                                avatarLink = '/users/' + inv.from._id;
                                avatar = inv.from.avatar;
                            }
                        }
                        let msg = '';
                        if(messageHeaderLink != null){
                            msg += '<a  href="'+ messageHeaderLink +'" class="font-weight-600">'+messageHeader+'</a>';
                        }
                        msg +=' ' + messageContent + ' ';
                        if(messageEndLink != null){
                            msg += '<a  href="'+messageEndLink+'" class="font-weight-600">'+ messageEnd +'</a>'
                        }
                        tempTrans.push({
                            avatar: avatar,
                            avatarLink: avatarLink,
                            messageHeader: messageHeader,
                            messageHeaderLink: messageHeaderLink,
                            messageContent: messageContent,
                            messageEnd: messageEnd,
                            messageEndLink: messageEndLink,
                            msg: msg,
                            createdAt: inv.createdAt,
                            fee: fee,
                            from: from,
                            _id: inv._id
                        });
                    }
                    if(this.type == 'income'){
                        this.income = tempTrans;
                    }
                    else{
                        this.outcome = tempTrans;
                    }
                    this.trans = tempTrans;
                }
                this.loading = false;
            }, (error) => {
                this.loading = false;
            });
        }

        if(this.type == 'income' && this.income.length > 0){
            this.trans = this.income;
        }
        if(this.type == 'outcome' && this.outcome.length > 0){
            this.trans = this.outcome;
        }
    }

    // tslint:disable-next-line:typedef
    formatPeriod(value) {
        return this.funcsService.displayTime(value) + '(' + this.funcsService.formatPeriod(value) + ')';
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onSelect($event: any) {
        
    }

    onActivate($event: any) {
        
    }

    onTabChange(event: any) {
        switch (event.index) {
            case 0:
                this.type = 'income'
                this.loadTrans()
                break;
            case 1:
                this.type = 'outcome'
                this.loadTrans()
                break;
        }
    }

    clear(all = '') {
        this.param_selected = [];
        let ids = 'all';
        if ((this.type == 'income' && this.income.length > 0) || this.type == 'outcome' && this.outcome.length > 0){
            this.selected.forEach((value) => {
                this.param_selected.push(value._id);
            });
            if (this.param_selected.length > 0) {
                ids = this.param_selected.join();
            }
            this.userService.deleteTransaction({ids: ids, type: this.type}).subscribe( (data) => {
                if(data['success'] == 1){
                    if (all === 'all') {
                        if(this.type == 'income'){
                            this.income = [];
                        }
                        else{
                            this.outcome = [];
                        }
                        this.trans = [];
                    }
                    else{
                        this.trans = this.trans.filter((item) => {
                            if (!ids.includes(item._id)){
                                return item;
                            }
                        });
                        if(this.type == 'income'){
                            this.income = this.trans;
                        }
                        else{
                            this.outcome = this.trans;
                        }
                    }
                }
            });
        }
    }
}
