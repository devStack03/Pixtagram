import { User } from 'app/shared/models/user.model';

export class Stl {
    title: string;          // name of stl
    tags: string[];         // tags array
    photos: string[];       // url of images
    description: string;
    assetFile: string;      // url of asset(stl) file
    assetType: number;      // 1: image, 2: stl(3d) file
    coins: number;          //
    viewCount: number;      //
    likeCount: number;      //
    downloadCount: number;  //
    createdAt: Date;        //
    isFlagged: Date;        //
    isDeleted: boolean;
    deletedAt: Date;
    user: User;

    category: string; // temp variable

    constructor(obj?: any) {
        this.title = obj && obj.title               || '';
        this.likeCount = obj && obj.likeCount       || 353;
        this.photos = [obj && obj.thumbUrl         || ''];

        this.user = new User();
        this.user.username = obj && obj.userName         || '';
        this.user.avatar = obj && obj.avatarUrl       || '';
        this.category = obj && obj.category         || 'web';
    }
}