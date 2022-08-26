import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , BehaviorSubject} from 'rxjs';
import { Message } from '../../models/message.model';
import { Room } from '../../models/room.model';
import { AppConfig } from '../../config';
import {NotificationService} from '../../global';
import { AppConstants } from '../../constants';
// tslint:disable-next-line:import-blacklist
import 'rxjs/Rx';


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    public notificationUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private typing: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private dialog: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    public chatNumber: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    currentTyping = this.typing.asObservable();
    currentDialog = this.dialog.asObservable();
    currentChatNumber = this.chatNumber.asObservable();
    uri = AppConfig.apiURL + 'chat/';
    constructor(private http: HttpClient,
                private notificationService: NotificationService) { }

    // tslint:disable-next-line:typedef
    getAll() {
        return this.http.get<Room[]>(this.uri);
    }

    public setNotificationUpdated(bool) {
        this.notificationUpdated.next(bool);
    }

    public deleteNotification(params = {}){
        return this.http.post(this.uri + 'deleteNotification',params);
    }

    public clearNotification(){
        return this.http.get(this.uri + 'clearNotification/');
    }

    getAllRooms(): Observable<any> {
        return this.http.get(this.uri + 'getRooms/');
    }

    getNotification(params = {}): Observable<any>{
        return this.http.post(this.uri + 'getNotification', params);
    }

    getRoom(roomId: string): Observable<any> {
        return this.http.get(this.uri + 'getRoom/' + roomId);
    }

    getMessages(roomId: string): Observable<any> {
        return this.http.get(this.uri + 'getMessages/' + roomId);
    }

    create(messageInfo): Observable<any> {
        return this.http.post(this.uri, messageInfo);
    }

    // tslint:disable-next-line:typedef
    update(messageInfo) {
        return this.http.post(this.uri + 'updateMessage/', messageInfo);
    }

    // tslint:disable-next-line:typedef
    delete(id: string) {
        return this.http.delete(this.uri + id);
    }

    // tslint:disable-next-line:typedef
    getUnreadMessage(){
        return this.http.post(this.uri + 'getUnreadMessage/', {});
    }

    // tslint:disable-next-line:typedef
    createRoom(param = {}){
        return this.http.post(this.uri + 'createRoom/', param);
    }

    getRoomswithScroll(start: number, count: number, searchText = ''): Observable<any> {
        return this.http.post(this.uri + 'testChat', {start: start, count: count, searchText: searchText});
    }
    public setTyping(typing = ''): void {
        this.typing.next(typing);
    }
    public setChatNumber(cNum = 0): void {
        this.chatNumber.next(cNum);
    }
    public addMsg(msg , reverse = 1, uid= ''): void {
        const currentValue = this.dialog.value;
        let updatedValue: any[] = [];
        if (reverse === 1) {
            this.dialog.value.unshift(msg);
            updatedValue  = this.dialog.value;
        }
        else {
            if (uid === msg.to) {
                msg.isSend = false;
            }
            updatedValue = [...currentValue, msg];
        }
        this.dialog.next(updatedValue);
    }

    public initMSG(): void{
        this.dialog.next([]);
    }
}
