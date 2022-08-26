import { Component, ViewEncapsulation, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConstants } from '../../../../../shared/constants';
import { UserService } from '../../../../../shared/services/user/user.service';
import { ChangeProfilePopupComponent } from '../pop-ups/change-profile-popup/change-profile-popup.component';
import { S3UploaderService } from 'app/shared/services/aws/s3-uploader.service';
import {AuthService} from '../../../../../shared/services/auth/auth.service';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-accounts-data',
  templateUrl: './accounts-data.component.html',
  styleUrls: ['./accounts-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AccountsDataComponent implements OnInit {
  file: any;

  profileForm: FormGroup;
  profileFormErrors: any;

  passwordForm: FormGroup;
  passwordFormErrors: any;

  privacyForm: FormGroup;
  privacyFormErrors: any;

  loading = false;
  submitted = false;
  hide = false;
  activatedRoute: string;
  user: any;
  routes = [
    'edit',
    'change-password',
    'privacy-security',
    'auth-apps',
    'email-sms',
    'manage-contacts'
    
  ];

  @ViewChild('photoInput') photoInput: ElementRef;
  @ViewChild('optionButton') private optionButton: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private uploaderService: S3UploaderService,
    private authService: AuthService
  ) {
    this.profileFormErrors = {
      username: {}
    };

    this.passwordFormErrors = {
      oldPassword: {},
      newPassword: {},
      passwordConfirm: {}
    };

  }

    // tslint:disable-next-line:typedef
  ngOnInit() {
    this.activatedRoute = this.route.snapshot.routeConfig.path;
    this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
    this.buildProfileForm();
    this.buildPasswordForm();
    this.buildPrivacyForm();
    if (this.user && this.user.followFee  && this.user.followFee > 0) {
        this.profileForm.get('following').patchValue('1');
    }
    else {
        this.profileForm.get('following').patchValue('0');
    }
  }

    // tslint:disable-next-line:typedef
  onFileInput(file) {
    this.file = file;
    if (this.uploaderService.ValidateImageFile(this.file.name)) {
    }
    this.uploaderService.uploadFile(this.file, (err, data) => {
      if ( AppConstants.TEST ) {
        err = null;
        data = {Location: 'http://localhost:4200/assets/images/avatars/james.jpg'};
      }
      if (err) {
        this.submitted = false;
        this.loading = false;
        return err;
      }
      if (data.Location) {
        const params = {
          pic_url: data.Location
        };
          // tslint:disable-next-line:no-shadowed-variable
        this.userService.updateAvatar(this.user.id, params).subscribe((data) => {
          this.submitted = false;
          this.loading = false;
          if (data['success'] === 1) {
            this.user.avatar = params.pic_url;
            this.authService.setCurrentUer(this.user);
          }
        });
    }
    });
  }

  /**
   * *******************************Profile Form ***************************************************
   */
  openDialog(): void {
    // event.stopPropagation();
    const dialogRef = this.dialog.open(ChangeProfilePopupComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 0) {
        this.uploadNewPhoto();
      } else if (result === 1) {
        this.removeCurrentPhoto();
      }
    });
  }

    // tslint:disable-next-line:typedef
  get profileF() { return this.profileForm.controls; }

    // tslint:disable-next-line:typedef
  private buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      username: [this.user.username, Validators.required],
      website: [this.user.website],
      bio: [this.user.bio],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone],
      gender: [this.user.gender.toString()],
      showNotification: [this.user.showNotification],
      // followFee: [this.user.followFee ? this.user.followFee : 0 , [Validators.min(0)]],
      following: [this.user.followFee && this.user.followFee > 0 ? '1' : '0', Validators.required],
      followfee: [this.user.followFee, [Validators.min(0)]],
    });
    this.profileForm.get('followfee').valueChanges.subscribe((data) => {
          // tslint:disable-next-line:radix
          this.user.followFee = data;
     });

    this.profileForm.get('following').valueChanges.subscribe((data) => {
        if (data === '0') {
            // tslint:disable-next-line:no-unused-expression
            this.profileForm.get('followfee').disable();
        }
        else {
            this.profileForm.get('followfee').enable();
        }
     });

    this.profileForm.valueChanges.subscribe(() => {
      this.onProfileFormValuesChanged();
    });
  }

    // tslint:disable-next-line:typedef
  private onProfileFormValuesChanged() {
    for (const field in this.profileFormErrors) {
      if (!this.profileFormErrors.hasOwnProperty(field)) {
        continue;
      }
      // Clear previous errors
      this.profileFormErrors[field] = {};

      // Get the control
      const control = this.profileForm.get(field);
      if (control && control.dirty && !control.valid) {
        this.profileFormErrors[field] = control.errors;
      }
    }
  }

    // tslint:disable-next-line:typedef
  protected onProfileSubmit() {
    if (this.profileForm.invalid) {
      return;
    }
    this.submitted = true;
    this.loading = true;
    const params = this.profileForm.getRawValue();
    params['id'] = this.user.id;
      // tslint:disable-next-line:radix
    if (parseInt(params['following']) === 0 ){
        params['followFee'] = 0;
    }
    else {
        params['followFee'] = params['followfee'] && params['followfee'] > 0 ? params['followfee'] : 0;
    }
    delete params['followfee'];
    delete params['following'];
    this.userService.update(params).subscribe((data) => {
      this.submitted = false;
      this.loading = false;
      this.user.username = params.username;
      this.user.website = params.website;
      this.user.bio = params.bio;
        // tslint:disable-next-line:radix
      this.user.gender = parseInt(params.gender);
      this.user.followFee = params.followFee;
      this.user.showNotification = params.showNotification;

      localStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));
      sessionStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));
      this.router.navigate(['profile']);
    });
  }

    // tslint:disable-next-line:typedef
  protected disableUser() {

  }

    // tslint:disable-next-line:typedef
  private removeCurrentPhoto() {
    this.userService.removeAvatar(this.user.id).subscribe((data) => {

    });
  }

  private uploadNewPhoto() {
    console.log('select photo => ', this.photoInput.nativeElement);
    const element = document.getElementById('user-avatar-input') as HTMLElement;
    console.log('select photo => ', element);
    setTimeout(() => {
      element.click();
    }, 200);
  }


  get passwordF() { return this.passwordForm.controls; }

  private buildPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.passwordForm.valueChanges.subscribe(() => {
      this.onPasswordFormValuesChanged();
    });
  }

  private onPasswordFormValuesChanged() {
    for (const field in this.passwordFormErrors) {
      if (!this.passwordFormErrors.hasOwnProperty(field)) {
        continue;
      }
      // Clear previous errors
      this.passwordFormErrors[field] = {};

      // Get the control
      const control = this.passwordForm.get(field);
      if (control && control.dirty && !control.valid) {
        this.passwordFormErrors[field] = control.errors;
      }
    }
  }

  protected onPasswordSubmit() {
    if (this.passwordForm.invalid) { return; }
    if (this.passwordF.confirmPassword.value !== this.passwordF.newPassword.value) {
      alert('New password not matched');
      return;
    }

    this.submitted = true;
    this.loading = true;
    console.log(this.passwordForm.getRawValue());
    var params = this.passwordForm.getRawValue();
    params['id'] = this.user.id;

    this.userService.updatePassword(params).subscribe((data) => {
      this.submitted = false;
      this.loading = false;
      alert('Your password changed successfully.');
      this.passwordForm.reset();
      this.router.navigate(['/profile']);    
    }, error => {
      this.submitted = false;
      this.loading = false;
      alert('Old password is incorrect.');
    });

  }

  /**
   * *******************************Privacy-policy Form ***************************************************
   */
  
  private buildPrivacyForm() {
    this.privacyForm = this.formBuilder.group({
      isPrivate: [this.user.isPrivate],
      showActivity: [this.user.showActivity],
      allowSharing: [this.user.allowSharing],
      
    });

    this.privacyForm.valueChanges.subscribe(() => {
      this.onPrivacyFormValuesChanged();
    });
  }

    // tslint:disable-next-line:typedef
  private onPrivacyFormValuesChanged() {
    for (const field in this.privacyFormErrors) {
      if (!this.privacyFormErrors.hasOwnProperty(field)) {
        continue;
      }
      // Clear previous errors
      this.privacyFormErrors[field] = {};

      // Get the control
      const control = this.privacyForm.get(field);
      if (control && control.dirty && !control.valid) {
        this.privacyFormErrors[field] = control.errors;
      }
    }
  }

  protected onPrivacySubmit() {
    if (this.privacyForm.invalid) {
      return;
    }
    this.submitted = true;
    this.loading = true;
    console.log(this.privacyForm.getRawValue());
    let params = this.privacyForm.getRawValue();
    params['id'] = this.user.id;

    this.userService.update(params).subscribe((data) => {
      this.submitted = false;
      this.loading = false;
      this.user.isPrivate = params.isPrivate;
      this.user.showActivity = params.showActivity;
      this.user.allowSharing = params.allowSharing;

      localStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));
      this.router.navigate(['/profile']);      

    });
  }

  /**
   * *******************************Privacy-policy Form ***************************************************
   */

}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {

  tiles: Tile[] = [
    { text: 'Upload Photo', cols: 1, rows: 1, color: 'lightblue' },
    { text: 'Remove Current Photo', cols: 1, rows: 1, color: 'lightgreen' }
  ];
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
