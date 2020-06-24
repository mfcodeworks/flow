export interface Profile {
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
}
