import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import {AuthService} from '../../../../../shared/services/auth/auth.service';
import {nnNetwork} from '../../../../../shared/constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import {AlertService} from '../../../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OauthComponent implements OnInit {
    loading = false;
  constructor(
      private activatedRoute: ActivatedRoute,
      private fuseConfig: FuseConfigService,
      private userAuthService: AuthService,
      private http: HttpClient,
      private alertService: AlertService,
      private router: Router,
      private route: ActivatedRoute,
  ) {

      this.fuseConfig.setConfig({
          layout: {
              navigation: 'none',
              toolbar: 'none',
              footer: 'none'
          }
      });
  }

  ngOnInit(): void {

  }

}
