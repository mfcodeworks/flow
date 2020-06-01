import { Injectable } from '@angular/core';
import Decimal from 'decimal.js';
import * as fx from 'money';
import { CurrencyDecimalPlaces } from '../../shared/core/currency-decimal-places.enum';
import { BackendService } from '../backend/backend.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IOpenExchangeRates } from '../../shared/core/open-exchange-rates';

@Injectable({
    providedIn: 'root'
})
export class MoneyService {
    constructor(private backend: BackendService) {}

    // Take base currency and convert to a displayable decimal
    format(amount: number, currency: string): string {
        return new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency
        }).format(this.compress(amount, currency));
    }

    // Take the number input and convert to base currency
    unformat(amount: number, currency: string): number {
        return this.uncompress(amount, currency);
    }

    // Compress format to decimal amount
    compress(amount: number, currency: string): number {
        return new Decimal(amount).div(new Decimal(10).pow(CurrencyDecimalPlaces[currency.toUpperCase()])).toNumber();
    }

    // Uncompress format to base denomination
    uncompress(amount: number, currency: string): number {
        return new Decimal(amount).times(new Decimal(10).pow(CurrencyDecimalPlaces[currency.toUpperCase()])).toNumber();
    }

    // Take a base currency and convert to a secondary currency
    convert(amount: number, from: string, to: string): Observable<number> {
        return this.updateRates().pipe(
            // Compress in base currency, convert to fx and uncompress using fx
            map(() => Math.round(
                this.uncompress(
                    fx(this.compress(amount, from)).convert({ from: from.toUpperCase(), to: to.toUpperCase() }),
                    from
                )
            ))
        )
    }

    // API: Update exchange rates
    updateRates(): Observable<void> {
        return this.backend.updateRates().pipe(
            map((data: IOpenExchangeRates) => {
                console.log('Open exchange rates:', data)
                fx.base = data.base;
                fx.rates = data.rates;
            })
        )
    }
}
