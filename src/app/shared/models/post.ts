export class Post {
    public id: string;
    public description: string;
    public title: string;
    public owner: any;
    public type: number;
    public media: string;
    public thumb?: string;
    public myLiked: boolean;
    public isFlagged: boolean;
    public isDeleted: boolean;
    public hashTags: [string];
    public deletedAt?: Date;
    public createdAt: Date;
    public updatedAt: Date;

    // customized
    public comments: [any];
    public commentCount: number;    
}