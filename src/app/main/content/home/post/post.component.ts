import { Component, OnInit , OnDestroy , ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { S3UploaderService } from '../../../../shared/services/aws/s3-uploader.service';
import { PostService } from '../../../../shared/services/post/post.service';
import { UserService } from '../../../../shared/services/user/user.service';
import { AppConstants, Const_countries } from '../../../../shared/constants';
import {SocketService} from '../../../../shared/services/socket.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  animations: fuseAnimations
})
export class PostComponent implements OnInit, OnDestroy {

  user: any;
  postForm: FormGroup;
  postFormErrors: any;
  loading = false;
  submitted = false;
  file: any;
  postType: any;
  countries: any;
  photoChangedEvent: any = '';

  @BlockUI() blockUI: NgBlockUI;

  @ViewChild('imgPhoto') imgPhoto;
  @ViewChild('imgVideo') imgVideo;

  _validImageFileExtensions = ['.jpg', '.jpeg', '.bmp', '.gif', '.png'];
  _validVideoFileExtensions = ['.flv', '.avi', '.mov', '.mpg', '.wmv', '.m4v', '.mp4', '.wma', '.3gp'];
  private _unsubscribeAll: Subject<any>;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uploaderService: S3UploaderService,
    private postService: PostService,
    private userService: UserService,
    private socketService: SocketService
  ) {
    this.postType = 1;
    this._unsubscribeAll = new Subject();
  }

    // tslint:disable-next-line:typedef
  ngOnInit() {

    const localUser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.user = localUser;

    this.countries = Const_countries;
    this.countries.sort( (a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0));

    this.postForm = this.formBuilder.group({
      title: ['', Validators.required],
      fee: [0, [Validators.min(0)]],
      feedon: ['1']
    });

  }

    // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
     // Unsubscribe from all subscriptions
     this._unsubscribeAll.next();
     this._unsubscribeAll.complete();
  }

  onOpenFile(id): void {
    document.getElementById(id).click();
  }

  onFileInput(file): void {
    this.file = file;

    if (this.uploaderService.ValidateImageFile(this.file.name)) {
      this.postType = 2;
      this.imgPhoto.nativeElement.src = URL.createObjectURL(file);
    }
    else if (this.ValidateVideoFile(this.file.name)) {
      this.postType = 3;
      const reader = new FileReader();
      const url = URL.createObjectURL(file);
      reader.onload = () => {
          this.imgVideo.nativeElement.src = url;
          this.imgVideo.nativeElement.play();
      };
      reader.readAsDataURL(file);
      
    }
  }

    // tslint:disable-next-line:typedef
  get f() { return this.postForm.controls; }
  // submit form values

    // tslint:disable-next-line:typedef
  onSubmit() {
    this.submitted = true;
    this.loading = true;

    this.blockUI.start('Sharing...');

    const params = {
      title: this.f.title.value,
      fee: this.f.fee.value,
      feedon: this.f.feedon.value
    };

    if (this.file) {

      if (this.postType > 3)
      {
        this.blockUI.stop();
        alert('Sorry, unsupported file type');
        this.submitted = false;
        this.loading = false;
        return;
      }
      params['type'] = this.postType;

      this.uploaderService.uploadFile(this.file, (err, data) => {
        if ( AppConstants.TEST ) {
          err = null;
          data = {Location: 'http://localhost:4200/assets/images/avatars/Abbott.jpg'};
        }

        if (err) {
          this.blockUI.stop();
          this.submitted = false;
          this.loading = false;
          return err;
        }
        params['media'] = data.Location ? data.Location : '';
        this.postService.create(params).subscribe((_data) => {
          this.submitted = false;
          this.loading = false;
          this.blockUI.stop();
          if (_data.success === 1 && _data.data) {
            // this.socketService.newPost(_data.data);
            window.history.back();
          }
        });
      });
    } else {
      this.postService.create(params).subscribe((_data) => {
        this.submitted = false;
        this.loading = false;
        this.blockUI.stop();
        if (_data.success === 1 && _data.data) {
          // this.socketService.newPost(_data.data);
          window.history.back();
        }
      });
    }
  }

    // tslint:disable-next-line:typedef
  private ValidateVideoFile(sFileName) {
    if (sFileName.length > 0) {
      let blnValid = false;
        // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < this._validVideoFileExtensions.length; j++) {
        const sCurExtension = this._validVideoFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
          blnValid = true;
          break;
        }
      }
      if (!blnValid) {
        return false;
      }
    }
    return true;
  }

    // tslint:disable-next-line:typedef
  private ValidateImageFile(sFileName) {
    if (sFileName.length > 0) {
      let blnValid = false;
        // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < this._validImageFileExtensions.length; j++) {
        const sCurExtension = this._validImageFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
          blnValid = true;
          break;
        }
      }
      if (!blnValid) {
        return false;
      }
    }
    return true;
  }

    // tslint:disable-next-line:typedef
  private fileExtension(url) {
    return url.split('.').pop().split(/\#|\?/)[0];
  }
}
