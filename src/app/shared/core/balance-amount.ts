export interface BalanceAmount {
    amount: number;
    currency: string;
    source_types?: {
        bank_account?: number;
        card?: number;
    }
}