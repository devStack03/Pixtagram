export class Comment {
    public id: string;
    public commenter: any;
    public post: any;
    public text: string;
    public isFlagged: boolean;
    public isDeleted: boolean;
    public createdAt: Date;
    public updatedAt: Date;
}