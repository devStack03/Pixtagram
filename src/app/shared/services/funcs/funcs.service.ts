import { Injectable } from '@angular/core';
import {formatDate} from '@angular/common';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FuncsService {

    constructor() { }

    // tslint:disable-next-line:typedef
  displayTime(currentTime = '') {
    return moment(currentTime).format('D-MMM-YYYY');
  }
  // tslint:disable-next-line:typedef
  formatPeriod(value) {
     let str: string = moment(value).fromNow();
     if (str.length > 3 && str.substr(str.length - 4) === 'ago') {
            str = str.substr(0, str.length - 4);
       }
     return str;
    }
    // tslint:disable-next-line:typedef
    formatFromNow(value) {
        return moment(value).fromNow();
    }
}
