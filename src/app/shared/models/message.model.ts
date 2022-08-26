export class Message {
    public id: string;    
    public room?: string;
    public message?: string;
    public media?: string;
    public short_url?: string;
    public status?: number; //  1:sent , 2:received, 3:read, 4:failed
    public identifier?: string;
    public message_type?: number; //  0:text , 1:photo, 2:video, 3:audio
    public thumb_url?: string;
    public from?: string;
    public to?: string;
    public flaged?: boolean;
    public private?: boolean;
    public date?: Date;
    public isDeleted1?: boolean;
    public isDeleted2?: boolean;
}