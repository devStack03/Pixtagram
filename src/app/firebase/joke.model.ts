export interface IJoke {
    id?: number;
    joke?: string;
    seq?: number;
    time?: string;
}
export class Joke implements IJoke {
    constructor(public id?: number, public joke?: string, public seq?: number, public time?: string) {}
}