import { Injectable } from '@angular/core';

@Injectable()
export class FileDetector {
    // tslint:disable-next-line:typedef
    getMimetype(signature) {
        switch (signature) {
            case '89504E47':
                return 'image/png';
            case '47494638':
                return 'image/gif';
            case '25504446':
                return 'application/pdf';
            case 'FFD8FFDB':
            case 'FFD8FFE0':
            case 'FFD8FFE1':
                return 'image/jpeg';
            case '504B0304':
                return 'application/zip';
            default:
                return 'Unknown filetype';
        }
    }
}