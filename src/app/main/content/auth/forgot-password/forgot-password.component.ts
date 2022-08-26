import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  resetPasswordFormErrors: any;

  submitted = false;
  loading = false;
  errorOccurred = false;
  error = 'Unknown Error';
  returnUrl: string;
  

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private userAuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.fuseConfig.setConfig({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.resetPasswordFormErrors = {
      email: {},
      password: {},
      passwordConfirm: {}
    };
  }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      passwordConfirm: ['', [Validators.required, confirmPassword]]
    });

    this.resetPasswordForm.valueChanges.subscribe(() => {
      this.onResetPasswordFormValuesChanged();
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.resetPasswordForm.controls; }
  /**
   * Submit
   */
  onSubmit() {
    console.log(this.resetPasswordForm.invalid);
    this.submitted = true;
    this.loading = true;
    this.errorOccurred = false;
    this.error = 'Unknown Error';
    this.userAuthService.forgetPassword(this.f.email.value, this.f.password.value).pipe(first()).subscribe((data) => {
      this.loading = false;
      // this.userAuthService.setLoggedIn(true);
      console.log('success : ', data);
      if (data.success && data.success > 0) {
        this.router.navigate([this.returnUrl]);
      } else {
        alert(data.error);
        // this.errorOccurred = true;
        // this.error = data.error;
      }      
    }, (error) => {
      this.loading = false;
      this.errorOccurred = true;
      console.log(error);
      if (error instanceof HttpErrorResponse) {
        this.error = error.error.error;
      } else {
        this.error = error;
      }
    });
  }

  onResetPasswordFormValuesChanged() {
    for (const field in this.resetPasswordFormErrors) {
      if (!this.resetPasswordFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.resetPasswordFormErrors[field] = {};

      // Get the control
      const control = this.resetPasswordForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.resetPasswordFormErrors[field] = control.errors;
      }
    }
  }
}

function confirmPassword(control: AbstractControl) {
  if (!control.parent || !control) {
    return;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if (!password || !passwordConfirm) {
    return;
  }

  if (passwordConfirm.value === '') {
    return;
  }

  if (password.value !== passwordConfirm.value) {
    return {
      passwordsNotMatch: true
    };
  }
}

