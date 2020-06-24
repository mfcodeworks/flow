import { Transaction } from './transaction';

export interface UserTransactions {
    sent: Transaction[];
    received: Transaction[];
}
