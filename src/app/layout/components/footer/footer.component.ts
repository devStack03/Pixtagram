import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Router, NavigationStart, ActivatedRoute} from '@angular/router';


@Component({
    selector   : 'footer',
    templateUrl: './footer.component.html',
    styleUrls  : ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy
{

    hiddenFooter: boolean;
    footerType: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private router: Router,
        private route: ActivatedRoute,
    )
    {
        this._unsubscribeAll = new Subject();
        
        this.footerType = '/';
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.footerType = event.url;
            }
        });
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.hiddenFooter = settings.layout.navbar.hidden === true;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
