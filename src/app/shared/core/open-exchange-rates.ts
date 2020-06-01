export interface IOpenExchangeRates {
    timestamp: number;
    base: string;
    rates: {
        [key: string]: number
    }
}
