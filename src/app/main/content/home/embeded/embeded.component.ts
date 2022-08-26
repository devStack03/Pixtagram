import {Component, Inject, OnInit} from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { AppConstants } from 'app/shared/constants';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
@Component({
  selector: 'app-embeded',
  templateUrl: './embeded.component.html',
  styleUrls: ['./embeded.component.scss'],
  animations: fuseAnimations
})
export class EmbededComponent implements OnInit {
  post: any = null;
  postForm: FormGroup;
  postFormErrors: any;
  url = '';
  user: any;
  constructor(
      private formBuilder: FormBuilder,
      private fuseConfig: FuseConfigService,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute) {
  }

  ngOnInit(): void {
      this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
      if(!this.user)
          this.fuseConfig.setConfig({
              layout: {
                  navigation: 'none',
                  toolbar: 'none',
                  footer: 'none'
              }
          });
      this.postForm = this.formBuilder.group({
          title: ['', Validators.required]
      });
      this.url = 'http://newbiefans.com/view-post/' + this.data + '?returnUrl=';
      // tslint:disable-next-line:variable-name
      const iframe_url = '<iframe src="' + this.url + '" width="267" height="476" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>';
      this.postForm.setValue({title: iframe_url});
  }

  onSubmit(): void {

  }

}
