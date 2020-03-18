export class Profile {
    id: number;
    username: string;
    name?: string;
    email?: string;
    profilePic: string;
    fcmToken?: string;
    settings: any;
    displayName?: string;
    stripeConnectId?: string;
    stripeCustomerId?: string;
    defaultCurrency?: string;
    country?: string;

    constructor(values: any = {}) {
        Object.assign(this, values);
    }

    toString(): string {
        return JSON.stringify(this)
    }
}
