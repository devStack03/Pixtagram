export interface ITopicSubscriptionResult {
    topic?: string;
    success?: boolean;
    errorCode?: string;
}

export class TopicSubscriptionResult implements ITopicSubscriptionResult {
    constructor(public topic?: string, public success?: boolean, public errorCode?: string) {}
}