export class Kudo {
    userName: string;
    avatarUrl: string;
    where: string;
    time: string;

    constructor(obj?: any) {
        this.userName = obj && obj.userName || '';
        this.avatarUrl = obj && obj.avatarUrl || '';
        this.where = obj && obj.category || 'While viewing your profile';
        this.time = obj && obj.time || '10 mins ago';
    }
    
}