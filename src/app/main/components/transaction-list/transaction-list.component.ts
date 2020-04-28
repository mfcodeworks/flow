import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Transaction } from '../../core/transaction';
import { UserService } from 'src/app/services/user/user.service';
import { Profile } from '../../core/profile';
import { MoneyService } from 'src/app/services/money/money.service';
import * as moment from 'moment';

@Component({
    selector: 'app-transaction-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './transaction-list.component.html',
    styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
    user: Profile;
    months: any[] = [];
    days: any[] = [];
    @Input() transactions: Transaction[] = [];

    constructor(
        public money: MoneyService,
        private user$: UserService
    ) {
        this.user = user$.profile;
    }

    ngOnInit() {
        console.log('Displaying Transactions', this.transactions);

        // Create month array
        for (let i in [0, 1, 2]) {
            this.months.push(moment().subtract(i, 'months'))
        }
    }

    trackTransactionById(index: number, item: Transaction) {
        return item.id;
    }
}
