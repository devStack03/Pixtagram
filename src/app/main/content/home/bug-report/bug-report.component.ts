import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { fuseAnimations } from '@fuse/animations';
import { S3UploaderService } from '../../../../shared/services/aws/s3-uploader.service';
import { ReportService } from '../../../../shared/services/report/report.service';
import { UserService } from '../../../../shared/services/user/user.service';
import {FuncsService} from '../../../../shared/services/funcs/funcs.service';
import { AppConstants } from '../../../../shared/constants';
import { MatDialog } from '@angular/material/dialog';
import {ReportDialogComponent} from '../report-dialog/report-dialog.component';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.scss'],
  animations: fuseAnimations
})
export class BugReportComponent implements OnInit {

    user: any;
    postForm: FormGroup;
    postFormErrors: any;
    loading = false;
    submitted = false;
    file: any;
    postType: any;
    _validImageFileExtensions = ['.jpg', '.jpeg', '.bmp', '.gif', '.png'];
    _validVideoFileExtensions = [];
    countries: any;

    bugs: any[] = [];
    selectedUser: any = null;

    loadings = true;
    loadsAtOnce = 10;
    isSearching = false;

    photoChangedEvent: any = '';

    @BlockUI() blockUI: NgBlockUI;

    @ViewChild('imgPhoto') imgPhoto;
    @ViewChild('imgVideo') imgVideo;

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private uploaderService: S3UploaderService,
      private reportService: ReportService,
      private userService: UserService,
      private _matDialog: MatDialog,
      private funcsService: FuncsService
  ) {
      this.postType = 1;
  }

  ngOnInit(): void {
      const localUser = JSON.parse(localStorage.getItem(AppConstants.currentUser));
      this.user = localUser;
      this.postForm = this.formBuilder.group({
          title: ['', Validators.required]
      });
      this.loadBugs();
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
    get f() { return this.postForm.controls; }

    onOpenFile(id): void {
        document.getElementById(id).click();
    }
    // tslint:disable-next-line:typedef
    onSubmit() {
        this.submitted = true;
        this.loading = true;

        this.blockUI.start('Reporting...');

        const params = {
            title: this.f.title.value
            // location: this.f.country.value,
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
                    console.log('There was an error uploading your file: ', err);

                    this.blockUI.stop();

                    this.submitted = false;
                    this.loading = false;
                    return err;
                }

                params['media'] = data.Location ? data.Location : '';
                this.reportService.create(params).subscribe((_data) => {
                    this.submitted = false;
                    this.loading = false;
                    this.blockUI.stop();
                    if (_data.success === 1) {
                        this.router.navigate(['/']);
                    }
                });
            });
        } else {
            this.reportService.create(params).subscribe((_data) => {
                this.submitted = false;
                this.loading = false;
                this.blockUI.stop();
                if (_data.success === 1) {
                    this.router.navigate(['/']);
                }
            });
        }
    }

    // tslint:disable-next-line:typedef
    onScroll(){
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.loadBugs();
    }
    // tslint:disable-next-line:typedef
    loadBugs() {
        this.loadings = true;
        this.reportService.getReports({from: this.bugs.length,  to: this.loadsAtOnce}).subscribe((res) => {
            if (res.success === 1) {
                for (const inv of res.data)
                {
                    let pending = 'pending';
                    if (inv.isFlagged) {
                        pending = 'Readed';
                    }

                    this.bugs.push({
                        title: inv.title,
                        description: inv.description,
                        createdAt: inv.createdAt,
                        pending: pending
                    });
                }
            }
            this.loadings = false;
        }, (error) => {
            this.loadings = false;
        });
    }

    // tslint:disable-next-line:typedef
    formatPeriod(value) {
        return this.funcsService.formatPeriod(value);
    }

    // tslint:disable-next-line:typedef
    openDialog(data){
        const dialogRef = this._matDialog.open(ReportDialogComponent, { width: '600px', data: data});
    }
}
