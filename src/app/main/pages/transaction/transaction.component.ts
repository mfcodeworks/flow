import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { BackendService } from '../../../services/backend/backend.service';
import { Transaction } from '../../../shared/core/transaction';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent implements OnInit {

    @Input() id: string;
    transaction: Observable<Transaction>;

    constructor(
        private dialogRef: ModalController,
        private backend: BackendService
    ) { }

    ngOnInit(): void {
        this.transaction = of(this.id).pipe(
            tap(tx => console.log('Fetching tx', tx)),
            switchMap(intent => this.backend.getTransactionByIntent(intent)),
            tap(tx => console.log(tx))
        );
    }

    close(): void {
        this.dialogRef.dismiss();
    }
}
