import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppConstants} from '../../../../shared/constants';
import { UserService } from '../../../../shared/services/user/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: fuseAnimations
})
export class SettingsComponent implements OnInit {

  profileForm: FormGroup;
  user: any;
  profileFormErrors: any;
  followFee = 0;
  loading = false;
  submitted = false;
  constructor(
      private formBuilder: FormBuilder,
      private userService: UserService
  ) { }

  ngOnInit(): void {
      this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
      if (this.user) {
          this.followFee = this.user.followFee = this.user.followFee ? this.user.followFee : 0;
      }
      this.buildProfileForm();
  }


  // tslint:disable-next-line:typedef
  onSubmit() {
      if (this.profileForm.invalid) {
          return;
      }
      this.submitted = true;
      this.loading = true;
      const params = this.profileForm.getRawValue();
      // tslint:disable-next-line:variable-name
      const u_param = {};
      u_param['followFee'] = params.followfee;
      this.userService.update(u_param).subscribe((data) => {
          this.submitted = false;
          this.loading = false;
          this.user.followFee = params.followfee;
          localStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));
          sessionStorage.setItem(AppConstants.currentUser, JSON.stringify(this.user));
      });
  }

    // tslint:disable-next-line:typedef
  private buildProfileForm() {
      this.profileForm = this.formBuilder.group({
          following: [this.user.followFee && this.user.followFee > 0 ? '1' : '0', Validators.required],
          followfee: [this.user.followFee, [Validators.min(0)]],
      });
      // this.profileForm.valueChanges.subscribe((data) => {
      //     this.user.followFee = data.followfee;
      //     this.profileForm.setValue({following : '1', followfee : 1});
      // });
      this.profileForm.get('followfee').valueChanges.subscribe((data) => {
          // tslint:disable-next-line:radix
          this.user.followFee = data;
          this.profileForm.patchValue({following : this.user.followFee && this.user.followFee > 0 ? '1' : '0'});
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
}
