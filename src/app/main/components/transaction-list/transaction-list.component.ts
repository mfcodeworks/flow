import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Transaction } from '../../../shared/core/transaction';
import { UserService } from 'src/app/services/user/user.service';
import { Profile } from '../../../shared/core/profile';
import { MoneyService } from 'src/app/services/money/money.service';
import { subMonths, format, compareDesc } from 'date-fns';

@Component({
    selector: 'app-transaction-list',
    templateUrl: './transaction-list.component.html',
    styleUrls: ['./transaction-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionListComponent implements OnInit {
    user: Profile;
    months: Map<string, Date> = new Map();
    days: any[] = [];
    @Input() transactions: Transaction[] = [];

    constructor(
        public money: MoneyService,
        private _user: UserService
    ) {}

    ngOnInit() {
        this.user = this._user.profile;

        // Create month array
        const now = new Date();
        for (let i of [0, 1, 2]) {
            const month = subMonths(now, i);
            this.months.set(format(month, 'MMM'), month);
        }
    }

    sortMonthMap(a: KeyValue<string, Date>, b: KeyValue<string, Date>): number {
        return compareDesc(a.value, b.value);
    }

    trackTransactionById(index: number, item: Transaction) {
        return item.id;
    }
}
