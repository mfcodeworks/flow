import { BalanceAmount } from './balance-amount';

export interface Balance {
    object: string;
    available: BalanceAmount[];
    connect_reserved?: BalanceAmount[];
    livemode: boolean;
    instant_available: BalanceAmount[];
    pending: BalanceAmount[];
}