import { Profile } from './profile';

export class Transaction {
    id: number;
    amount: number;
    currency: string;
    status: string;
    type: string;
    forUserId: number;
    fromUserId: number;
    stripeTransactionId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    forUser: Profile;
    fromUser: Profile;

    constructor(values: any = {}) {
        Object.assign(this, values);
    }

    toString(): string {
        return JSON.stringify(this)
    }
}
