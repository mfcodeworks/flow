import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { MoneyService } from 'src/app/services/money/money.service';
import { Balance } from '../../../shared/core/balance';
import { BalanceAmount } from '../../../shared/core/balance-amount';
import { BalanceHoldings } from '../../../shared/core/balance-holdings';

@Component({
    selector: 'app-balance-display',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './balance-display.component.html',
    styleUrls: ['./balance-display.component.scss']
})
export class BalanceDisplayComponent implements OnChanges {
    @Output() currency: EventEmitter<string> = new EventEmitter();
    @Input() balances: Balance;
    balance: BalanceHoldings = {}
    balanceCurrencies: string[] = [];
    selectedCurrency: string;

    constructor(private money: MoneyService) {}

    ngOnChanges() {
        /* Map balances */
        this.balances?.available.forEach((b: BalanceAmount, i: number) => {
            this.balance[b.currency] = {
                available: this.money.format(
                    b.amount,
                    b.currency
                ),
                pending: this.money.format(
                    this.balances.pending[i].amount,
                    this.balances.pending[i].currency
                )
            }
        });
        this.balanceCurrencies = Object.keys(this.balance);
        this.selectedCurrency = this.balanceCurrencies[0];
        this.currency.emit(this.selectedCurrency);
    }

    onCurrencyChange(ev: any): void {
        console.log('Currency change', ev);
        this.currency.emit(ev.value);
    }
}
