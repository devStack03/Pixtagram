export class Room {
    public id?: string;
    public participant1?: string;
    public participant2?: string;
    public lastMessage?: string;
    public isFriend?: boolean;
    public lastSeenDateOfPart1?: Date;
    public lastSeenDateOfPart2?: Date;
    public lastActiveDate?: Date;
}