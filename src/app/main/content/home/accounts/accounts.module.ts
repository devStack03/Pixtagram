import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../../../app-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Router, Routes } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { MainSidenavComponent } from '../accounts/main-sidenav/main-sidenav.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { AccountsDataComponent, DialogOverviewExampleDialog } from '../accounts/accounts-data/accounts-data.component';
import { BrowserModule } from '@angular/platform-browser';
import { ChangeProfilePopupComponent } from './pop-ups/change-profile-popup/change-profile-popup.component';
import {MatRadioModule} from '@angular/material/radio';

const routes: Routes = [
    {
        path: 'edit',
        component: AccountsComponent
    },
    {
        path: 'change-password',
        component: AccountsComponent
    },
    {
        path: 'privacy-security',
        component: AccountsComponent
    },
    {
        path: 'auth-apps',
        component: AccountsComponent
    },
    {
        path: 'email-sms',
        component: AccountsComponent
    },
    {
        path: 'manage-contacts',
        component: AccountsComponent
    },
    {
        path: '**',
        redirectTo: 'edit'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        AppMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        RouterModule,
        SharedModule,
        MatRadioModule,
    ],
    declarations: [
        AccountsComponent,
        AccountsDataComponent,
        MainSidenavComponent,
        DialogOverviewExampleDialog,
        ChangeProfilePopupComponent
    ],
    entryComponents: [
        DialogOverviewExampleDialog,
        ChangeProfilePopupComponent
    ]
})
export class AccountsModule { }
