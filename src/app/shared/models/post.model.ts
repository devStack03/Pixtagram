export class Post {
    public id: string;
    public title: string;
    public owner: any;
    public tags: string[];
    public photos: string[];
    public description: string;

    public assetFile: string;
    public assetType: number;

    public coins: number;

    public viewCount: number;
    public likeCount: number;
    public downloadCount: number;
    public bookmarkCount: number;
    
    public createdAt: Date;
    public updatedAt: Date;

    // customized
    public comments: [any];
    public commentCount: number;    
}