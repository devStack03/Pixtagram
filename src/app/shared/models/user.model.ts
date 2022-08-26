export class User {
    public id: string;
    public username?: string;
    public email?: string;
    public firstname?: string;
    public lastname?: string;
    public avatar?: string;
    public bgImage?: string;
    public bio?: string;
    public country?: string;
    public deletedAt?: Date;
    public createdAt: Date;
    public updatedAt: Date;
    public newUser?: boolean;
    public o_auth?: {
        facebook: {
            id: string,
            access_token: string
        },
        google: {
            id: string,
            access_token: string
        }
    };
    public token: string
}