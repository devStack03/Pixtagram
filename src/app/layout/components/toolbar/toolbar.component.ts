import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject ,  Subscription } from 'rxjs';
import { takeUntil ,  debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { navigation } from 'app/navigation/navigation';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { AppConstants } from '../../../shared/constants';
import { SearchConfigService } from './searchconfig.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {SocketService} from '../../../shared/services/socket.service';
import {ChatService} from '../../../shared/services/chat/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {NgxNotificationMsgService, NgxNotificationStatusMsg} from 'ngx-notification-msg';
import * as moment from 'moment';
import {NotifyComponentComponent} from '../notify-component/notify-component.component';
import { ToastrService } from 'ngx-toastr';
import {UserService} from '../../../shared/services/user.service';
@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy {

    @ViewChild('SettingMenuDialog') settingMenuDialog;
    private msgSubscription: Subscription;
    private likeSubscription: Subscription;
    private bookmarkSubscription: Subscription;
    private commentSubscription: Subscription;
    private commentLikeSubscription: Subscription;
    private unreadSubscription: Subscription;
    private notificationSubscription: Subscription;
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    user: any;
    searchInput: FormControl;
    notifications: any[];
    toolbarType: string;
    toolbarName: string;
    showSetting: boolean;
    showComposeChat: boolean;
    dialog: any[];
    userList: any[] = [];
    showUsers = false;
    balanceRefresh = false;
    nnBalance = 0;
    readed = 0;
    message: any;
    // tslint:disable-next-line:variable-name
    msg_count = 0;
    chatNumber = 0;
    public dialogRef: MatDialogRef<ToolbarComponent>;

    // Private
    private _unsubscribeAll: Subject<any>;


    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private searchConfigService: SearchConfigService,
        private _matDialog: MatDialog,
        private socketService: SocketService,
        private chatService: ChatService,
        private _matSnackBar: MatSnackBar,
        private readonly ngxNotificationMsgService: NgxNotificationMsgService,
        private toastr: ToastrService,
        public userService: UserService)
     {

        this.notifications = [];
        this.readed = 0;
        this.searchInput = new FormControl('');
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'tr',
                title: 'Turkish',
                flag: 'tr'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();


        this.searchInput.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchText => {
            this.searchConfigService.setSearch(searchText);
        });

        this.toolbarType = '/';
        this.showSetting = false;
        this.showComposeChat = false;
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.toolbarType = event.url;
                this.showSetting = false;
                this.showComposeChat = false;
                this.showUsers = false;
                
                switch (this.toolbarType) {
                    case '/profile':
                        this.toolbarName = this.user ? this.user.username : '';
                        this.showSetting = true;
                        break;
                    case '/accounts/edit':
                        this.toolbarName = 'Edit Profile';
                        break;
                    case '/accounts/change-password':
                        this.toolbarName = 'Change Password';
                        break;
                    case '/accounts/privacy-security':
                        this.toolbarName = 'Privacy and Security';
                        break;
                    case '/post':
                        this.toolbarName = 'New Post';
                        break;
                    case '/search':
                        this.toolbarName = 'Search';
                        break;
                    case '/messages':
                        this.toolbarName = 'Direct Messages';
                        this.showComposeChat = true;
                        break;
                    case '/new-message':
                        this.toolbarName = 'New Message';
                        this.showComposeChat = true;
                        break;
                    default:
                        this.toolbarName = this.user ? this.user.username : '';
                }

                if (this.toolbarType.includes('/chat')) {
                    const chatRoom = JSON.parse(sessionStorage.getItem(AppConstants.chatRoom));
                    this.userList = [];

                    // tslint:disable-next-line:triple-equals
                    if (chatRoom && chatRoom['new'] == true) {
                        for ( const user of chatRoom['selectedUsers']) {
                            this.userList.push(user);
                        }

                        // tslint:disable-next-line:triple-equals
                    } else if (chatRoom && chatRoom['new'] == false) {
                        this.userList.push(chatRoom['receiver']);
                    }
                    this.showUsers = true;
                }
            }
        });

    }

    // tslint:disable-next-line:typedef
    onComposeChatClicked() {
        switch (this.toolbarType) {
            case '/messages':
                this.router.navigate(['new-message']);
                break;
            case '/new-message':
                this.searchConfigService.setSearch('new-message');
                break;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to the config changes
        // tslint:disable-next-line:variable-name
        const sfw_init = this.authService.getCookie('sfw') ? JSON.parse(this.authService.getCookie('sfw')).sfw : 'N';
        this.userService.sfw.next(sfw_init);
        this.route.queryParams
            .subscribe(params => {
                    // console.log(params); // { orderby: "price" }
                    // this.orderby = params.orderby;
                    // console.log(this.orderby); // price
                    const tmp = params.sfw;
                    if (tmp) {
                        this.userService.sfw.next(tmp);
                        this.authService.setSfw(tmp);
                    }
                }
            );
        this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        this.socketService.requestPermission().pipe(takeUntil(this._unsubscribeAll)).subscribe((token) => {
            if (token && this.user ) {
                if (localStorage.getItem('fcm_token') !== token){
                    this.userService.update({id: this.user.id, fcm_token: token}).subscribe((res) => {
                        if (res['success'] === 1) {
                            localStorage.setItem('fcm_token', token);
                        }
                    });
                }

            }
        }, (err) => {

        });
        this.socketService.listen().pipe(takeUntil(this._unsubscribeAll)).subscribe((msg) => {
            if (this.router.url.includes('/messages')){
                if (msg['data'] && msg['data']['gcm.notification.data']){
                    this.socketService.onMsg.next(JSON.parse(msg['data']['gcm.notification.data']));
                }
            }

            if (this.router.url.includes('/chat/') || this.router.url.includes('/messages')){

            }
            else{

                if (msg['data'] && msg['data']['gcm.notification.data']) {
                    this.message = JSON.parse(msg['data']['gcm.notification.data']);
                    this.msg_count++;
                    // tslint:disable-next-line:variable-name
                    let cur_msg = '';
                    if (this.message.message_type === 1) {
                        cur_msg = this.message.message;
                    }
                    else{
                        cur_msg = '<img src="/assets/images/icons/empty.png" width="50">';
                    }
                    let cha: any;
                    if (this.msg_count % 4 === 0) {
                        cha = this.toastr.info(cur_msg, this.message.username, {
                            progressBar: true,
                            timeOut: 10000,
                            enableHtml: true,
                        });
                    }

                    else if (this.msg_count % 4 === 1) {
                        cha = this.toastr.success(cur_msg, this.message.username, {
                            progressBar: true,
                            timeOut: 10000,
                            enableHtml: true
                        });
                    }
                    else if (this.msg_count % 4 === 2) {
                        cha = this.toastr.error(cur_msg, this.message.username, {
                            progressBar: true,
                            timeOut: 10000,
                            enableHtml: true
                        });
                    }
                    else {
                        cha = this.toastr.warning(cur_msg, this.message.username, {
                            progressBar: true,
                            timeOut: 10000,
                            enableHtml: true
                        });
                    }
                    cha.onTap
                        .pipe(take(1))
                        .subscribe((actions) => {this.toasterClickedHandler(); });
                    this.chatService.setChatNumber(this.chatService.chatNumber.getValue() + 1);
                }
            }
        });
        this.chatService.currentChatNumber.pipe(takeUntil(this._unsubscribeAll)).subscribe(cnum => {
            this.chatNumber = cnum;
        });
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { 'id': this._translateService.currentLang });
        if (this.user != null && this.user.id) {
            this.doRefreshBlanceToNN(false);

            this.socketService.connectUser(this.user.id);
            // this.msgSubscription = this.socketService.getMessages().pipe(takeUntil(this._unsubscribeAll)).subscribe((message: any) => {
            //     if (this.router.url.includes('/chat/') || this.router.url.includes('/messages')){
            //
            //     }
            //     else{
            //         this.message = message;
            //         this.msg_count++;
            //         // tslint:disable-next-line:variable-name
            //         let cur_msg = '';
            //         if (message.message_type === 1) {
            //             cur_msg = message.message;
            //         }
            //         else{
            //             cur_msg = '<img src="/assets/images/icons/empty.png" width="50">';
            //         }
            //         let cha: any;
            //         if (this.msg_count % 4 === 0) {
            //             cha = this.toastr.info(cur_msg, message.username, {
            //                 progressBar: true,
            //                 timeOut: 10000,
            //                 enableHtml: true,
            //             });
            //         }
            //
            //         else if (this.msg_count % 4 === 1) {
            //             cha = this.toastr.success(cur_msg, message.username, {
            //                 progressBar: true,
            //                 timeOut: 10000,
            //                 enableHtml: true
            //             });
            //         }
            //         else if (this.msg_count % 4 === 2) {
            //             cha = this.toastr.error(cur_msg, message.username, {
            //                 progressBar: true,
            //                 timeOut: 10000,
            //                 enableHtml: true
            //             });
            //         }
            //         else {
            //             cha = this.toastr.warning(cur_msg, message.username, {
            //                 progressBar: true,
            //                 timeOut: 10000,
            //                 enableHtml: true
            //             });
            //         }
            //         cha.onTap
            //             .pipe(take(1))
            //             .subscribe((actions) => {this.toasterClickedHandler(); });
            //         this.chatService.setChatNumber(this.chatService.chatNumber.getValue() + 1);
            //     }
            // });
            this.likeSubscription = this.socketService.takeLike().pipe(takeUntil(this._unsubscribeAll)).subscribe((param) => {
                if (this.user.id === param.owner && param.like){
                    const notificationMsg = this.toastr.error(param.username + ' liked your post', param.username, {
                        progressBar: true,
                        timeOut: 5000,
                        enableHtml: true,
                        positionClass: 'toast-bottom-right',
                    });
                    notificationMsg.onTap
                        .pipe(take(1))
                        .subscribe((actions) => {this.gotoPost(param.id); });
                    this.notifications.unshift( {
                        postId: param.id,
                        msg: param.username + ' liked your post',
                        createdAt: param.createdAt,
                        username: param.username,
                        _id: param._id,
                        avatar: param.avatar
                    });
                    this.readed++;
                }
            });
            this.bookmarkSubscription = this.socketService.checkBookMark().pipe(takeUntil(this._unsubscribeAll)).subscribe((param) => {
                if (this.user.id === param.owner && param.bookmark){
                    this._matSnackBar.openFromComponent(NotifyComponentComponent,
                        {
                            data: {id: param.id, msg: param.username + ' bookmarked your post'},
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                            panelClass: 'bg-white',
                            duration: 6000
                        });
                    this.notifications.unshift( {
                        postId: param.id,
                        msg: param.username + 'bookmarked your post',
                        createdAt: param.createdAt,
                        username: param.username,
                        _id: param._id,
                        avatar: param.avatar
                    });
                    this.readed++;
                }
            });
            this.commentLikeSubscription =  this.socketService.checkLikeComment().pipe(takeUntil(this._unsubscribeAll)).subscribe((param) => {
                if (this.user.id === param.owner){
                    const notificationMsg = this.toastr.error(param.username + ' liked your comment', param.username, {
                        progressBar: true,
                        timeOut: 5000,
                        enableHtml: true,
                        positionClass: 'toast-bottom-right',
                    });
                    notificationMsg.onTap
                        .pipe(take(1))
                        .subscribe((actions) => {this.gotoPost(param.id); });
                    this.notifications.unshift( {
                        postId: param.id,
                        msg: param.username + ' liked your comment',
                        createdAt: param.createdAt,
                        username: param.username,
                        _id: param._id,
                        avatar: param.avatar
                    });
                    this.readed++;
                }

            });
            this.commentSubscription = this.socketService.getComment().pipe(takeUntil(this._unsubscribeAll)).subscribe((param) => {

                if (this.user.id === param.owner){
                    this._matSnackBar.openFromComponent(NotifyComponentComponent,
                        {
                            data: {id: param.id, msg: param.username + ' added a comment to your post'},
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                            panelClass: 'bg-white',
                            duration: 6000
                        });
                    this.notifications.unshift( {
                        postId: param.id,
                        msg: param.username + ' added a comment to your post',
                        createdAt: param.createdAt,
                        username: param.username,
                        _id: param._id,
                        avatar: param.avatar
                    });
                    this.readed++;
                }
            });
            this.notificationSubscription = this.chatService.getNotification({from: this.notifications.length, to: 10, userId: this.user.id}).
            pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                if (data && data['success']) {
                    const notReadNoti = data.data.filter((item) => {
                        if (item.read === false){
                            return item;
                        }
                    });
                    // tslint:disable-next-line:forin
                    for (const inv of data.data){
                        let m = '';
                        if (inv.type === 1){
                            m = inv.sender.username + ' liked your post';
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
                        this.notifications.push( {
                            postId: inv.postId,
                            msg: m,
                            createdAt: inv.createdAt,
                            username: inv.sender.username,
                            _id: inv.sender._id,
                            avatar: inv.sender.avatar ? inv.sender.avatar : '/assets/images/avatars/Velazquez.jpg'
                        });
                    }
                    if (notReadNoti &&  notReadNoti.length > 0) {
                        this.readed = notReadNoti.length;
                    }
                }
            });
            this.unreadSubscription = this.chatService.getUnreadMessage().pipe(takeUntil(this._unsubscribeAll)).subscribe((data: any) => {
               if (data && data['success']){
                   this.chatService.setChatNumber(data.data.msgCount);
               }
            });
        }

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void {
        // Do your search here...
        // console.log(value);
    }
    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    /**
     * log out
     */
    // tslint:disable-next-line:typedef
    logout() {
        this.authService.logout();
        // this.router.navigate(['login']);
        location.href = '/login';
    }

    // tslint:disable-next-line:typedef
    report(){
        this.router.navigate(['bug_report']);
    }

    // tslint:disable-next-line:typedef
    showProfile() {
        this.router.navigate(['profile']);
    }

    // tslint:disable-next-line:typedef
    showFollowSet(){
        this.router.navigate(['settings']);
    }

    // tslint:disable-next-line:typedef
    showMessages() {
        this.router.navigate(['messages']);
    }

    // tslint:disable-next-line:typedef
    onBack() {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        // console.log(returnUrl);
        if (!returnUrl) {
            window.history.back();
        } else {
            const returnParams = this.route.snapshot.queryParams;
            // console.log(returnParams);
            // this.router.navigate([returnUrl], { queryParams: returnParams } );  
            this.router.navigate([returnUrl], {queryParams: returnParams});
        }
    }

    // tslint:disable-next-line:typedef
    onComposeChat() {

    }

    // tslint:disable-next-line:typedef
    onSettingClicked() {
        // console.log('share clicked');

        this.dialogRef = this._matDialog.open(this.settingMenuDialog, {
            panelClass: 'menu-form-dialog'
        });
        this.dialogRef.afterClosed().subscribe(result => {
            // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
            if (!result) {
                return;
            }

            const actionType: string = result[0];
            switch (actionType) {
                case 'logout':
                    this.logout();
                    break;
                case 'Edit Profile':
                    this.router.navigate(['accounts/edit']);
                    console.log('Edit Profile');
                    break;
                case 'Change Password':
                    this.router.navigate(['accounts/change-password']);
                    console.log('Change Password');
                    break;
                case 'Privacy and Security':
                    this.router.navigate(['accounts/privacy-security']);
                    console.log('Privacy and Security');
                    break;
                case 'cancel':
                    console.log('Cancel');
                    break;
            }
        });
    }

    // tslint:disable-next-line:typedef
    getSettingLabel(path) {
        // return path.substring(path.lastIndexOf('/') + 1);
        switch (path.substring(path.lastIndexOf('/') + 1)) {
            case 'edit':
                return 'Edit Profile';
                break;
            case 'change-password':
                return 'Change Password';
                break;
            case 'privacy-security':
                return 'Privacy and Security';
                break;
        }
    }

    // tslint:disable-next-line:typedef
    collapse() {

    }

    // tslint:disable-next-line:typedef
    clearNotifications() {
        this.readed = 0;
        this.chatService.clearNotification().subscribe((data) => {
            this.notifications = [];
        });
    }
    // tslint:disable-next-line:typedef
    gotoProfile(id) {
        this.router.navigate(['profile_view', id]);
    }
    // tslint:disable-next-line:typedef
    formatFromNow(value) {
        return moment(value).fromNow();
    }

    // tslint:disable-next-line:typedef
    gotoNotifiList(){
        this.router.navigate(['notification_list']);
    }

    // tslint:disable-next-line:typedef
    onMenuOpen($event: void) {
        this.chatService.deleteNotification().subscribe((data) => {
            this.readed = 0;
        });
    }

    // tslint:disable-next-line:typedef
    toasterClickedHandler(){
        this.router.navigate(['messages']);
    }

    // tslint:disable-next-line:typedef
    gotoPost(postId){
        this.router.navigate(['view-post/' + postId]);
    }

    // tslint:disable-next-line:typedef
    refreshBalance() {
        this.doRefreshBlanceToNN(true);
    }

    // tslint:disable-next-line:typedef
     doRefreshBlanceToNN(continueRefresh = false) {
        this.balanceRefresh = true;
        if (!continueRefresh) {
            this.userService.getBalanceFromNN().pipe(take(1)).subscribe((data: any) => {
                this.balanceRefresh = false;
                if (data['success'] === 1) {
                    this.userService.balance.next(data['data'].balance);
                }
            }, err => {
                this.balanceRefresh = false;
            });
        }
        else{
            this.userService.getBalanceFromNN().pipe(takeUntil(this._unsubscribeAll)).subscribe((data: any) => {
                this.balanceRefresh = false;
                if (data['success'] === 1) {
                    this.userService.balance.next(data['data'].balance);
                }
            }, err => {
                this.balanceRefresh = false;
            });
        }
    }

    // tslint:disable-next-line:typedef
    showTransaction() {
        this.router.navigate(['transaction']);
    }
}
