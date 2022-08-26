export class User {
    public id: string;
    public username: string;
    public name?: string;
    public email?: string;
    public gender?: string;
    public age?: string;
    public city?: string;
    public state?: string;
    public zipcode?: string;
    public firstname?: string;
    public lastname?: string;
    public avatar?: string;
    public type?: number;
    public emailVerified?: boolean;
    public bio?: string;
    public country?: string;
    public company?: string;
    public phone?: string;
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