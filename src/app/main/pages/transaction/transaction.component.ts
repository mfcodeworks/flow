import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BackendService } from '../../../services/backend/backend.service';
import { Transaction } from '../../core/transaction';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent {

    id: Observable<string> = this.route.paramMap.pipe(map(m => m.get('id')));
    transaction: Observable<Transaction> = this.id.pipe(
        switchMap(intent => this.backend.getTransactionByIntent(intent)),
        tap(tx => console.log(tx))
    );

    constructor(
        private route: ActivatedRoute,
        private backend: BackendService
    ) { }

}
