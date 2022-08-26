import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {getMessaging, getToken, onMessage} from "firebase/messaging";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

    onMsg: BehaviorSubject<any>;
    onMsgChanged: Subject<any>;

    constructor(private socket: Socket) {
        this.onMsg = new BehaviorSubject<any>(null);
    }

    // tslint:disable-next-line:typedef
    public sendMessage(message, room= ''){
        this.socket.emit('new-message', {msg: message, room: room});
    }

    // tslint:disable-next-line:typedef
    public removeRoom(room= ''){
        this.socket.emit('remove-room', {room: room});
    }

    public connectUser = (uid) => {
        this.socket.emit('connecting', uid);
    }

    public leaveRoom = (params) => {
        this.socket.emit('leave-room', params);
    }

    public sendTyping = (typing = {}) => {
        this.socket.emit('typing', typing);
    }

    public joinRoom = (room= '') => {
        this.socket.emit('join-room', {room: room});
    }

    public sendLike = (param= {}) => {
        this.socket.emit('likepost', param);
    }

    public addLikeComment  = (param = {}) => {
        this.socket.emit('likeComment', param);
    }

    public addComment = (param: {}) => {
        this.socket.emit('comment', param);
    }

    public newPost = (param: {}) => {
        this.socket.emit('newpost', param);
    }

    public sendNotification = (param: {}) => {
        this.socket.emit('webpush', param);
    }

    public newPostNotification = () => {
        return Observable.create((observer) => {
            this.socket.on('newpost' , (param) => {
                observer.next(param);
            });
        });
    }

    public getPush = () => {
        return Observable.create((observer) => {
            this.socket.on('webpush' , (param) => {
                observer.next(param);
            });
        });
    }

    public getComment = () => {
        return Observable.create((observer) => {
            this.socket.on('comment' , (param) => {
                observer.next(param);
            });
        });
    }

    public sendBookMark = (param= {}) => {
        this.socket.emit('bookmark', param);
    }

    public checkBookMark = () => {
        return Observable.create((observer) => {
            this.socket.on('bookmark' , (param) => {
                observer.next(param);
            });
        });
    }

    public checkLikeComment = () => {
        return Observable.create((observer) => {
            this.socket.on('likeComment' , (param) => {
                observer.next(param);
            });
        });
    }

    public checkedRoom = () => {
        return Observable.create((observer) => {
            this.socket.on('remove-room' , (param) => {
                observer.next(param);
            });
        });
    }

    public takeLike = () => {
        return Observable.create((observer) => {
            this.socket.on('likepost' , (param) => {
                observer.next(param);
            });
        });
    }

    public getMessages = (id = '') => {
        return Observable.create((observer) => {
            this.socket.on('new-message' , (message) => {
                observer.next(message);
            });
        });
    }

    public getMsg = () => {
        return Observable.create((observer) => {
            this.socket.on('new-msg' , (message) => {
                observer.next(message);
            });
        });
    }

    public typingNotification = () => {
        return Observable.create((observer) => {
            this.socket.on('typing' , (message) => {
                observer.next(message);
            });
        });
    }
    // tslint:disable-next-line:typedef
    requestPermission() {
        return Observable.create((observer) => {
            const messaging = getMessaging();
            getToken(messaging,
                { vapidKey: environment.firebase.vapidKey}).then(
                (currentToken) => {
                    if (currentToken) {
                        observer.next(currentToken);
                    } else {
                        observer.error('No registration token available. Request permission to generate one.');
                    }
                }).catch((err) => {
                    observer.error(err);
            });
        });
    }
    // tslint:disable-next-line:typedef
    listen() {
        return Observable.create((observer) => {
            const messaging = getMessaging();
            onMessage(messaging, (payload) => {
                observer.next(payload);
            });
        });
    }

}
