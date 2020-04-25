import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MoneyService } from 'src/app/services/money/money.service';
import { MatSelectChange } from '@angular/material/select';

interface BalanceAmount {
    amount: number;
    currency: string;
}
interface Balance {
    object: string;
    available: BalanceAmount[];
    connect_reserved?: BalanceAmount[];
    livemode: boolean;
    pending: BalanceAmount[];
}
interface BalanceHoldings {
    currency?: {
        available: string,
        pending: string
    }
}

@Component({
    selector: 'app-balance-display',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './balance-display.component.html',
    styleUrls: ['./balance-display.component.scss']
})
export class BalanceDisplayComponent implements OnInit {
    @Output() currency: EventEmitter<string> = new EventEmitter();
    @Input() balances: Balance;
    balance: BalanceHoldings = {}
    balanceCurrencies: string[] = [];
    selectedCurrency: string;

    constructor(private money: MoneyService) {}

    ngOnInit() {
        /* Map balances */
        for (let i = 0; i < this.balances.available.length; i++) {
            this.balance[this.balances.available[i].currency] = {
                available: this.money.format(
                    this.balances.available[i].amount,
                    this.balances.available[i].currency
                ),

                pending: this.money.format(
                    this.balances.pending[i].amount,
                    this.balances.pending[i].currency
                ),
            };
        }
        this.balanceCurrencies = Object.keys(this.balance);
        this.selectedCurrency = this.balanceCurrencies[0];
        this.currency.emit(this.selectedCurrency);
    }

    onCurrencyChange(ev: any): void {
        console.log('Currency change', ev);
        this.currency.emit(ev.value);
    }
}
