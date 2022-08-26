import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()

export class NotificationService {
    private unread = new BehaviorSubject<any>({});
    casts = this.unread.asObservable();

    constructor() {
    }

    change(prod: any): void{
        this.unread.next(prod);
    }
}
