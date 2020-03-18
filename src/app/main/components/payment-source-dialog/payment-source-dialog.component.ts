import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from 'src/app/services/backend/backend.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PaymentMethodDialogData {
    paymentMethod: string;
}

@Component({
    selector: 'app-payment-source-dialog',
    templateUrl: './payment-source-dialog.component.html',
    styleUrls: ['./payment-source-dialog.component.scss']
})
export class PaymentSourceDialogComponent implements OnInit {
    id: string;
    source$: Observable<any>;
    delete$: Observable<boolean>;
    processing = false;

    constructor(
        private _backend: BackendService,
        public dialogRef: MatDialogRef<PaymentMethodDialogData>,
        @Inject(MAT_DIALOG_DATA) public data: PaymentMethodDialogData
    ) {
        this.id = data.paymentMethod
    }

    ngOnInit(): void {
        this.source$ = this._backend.getUserSource(this.id);
        this.delete$ = this._backend.deleteUserSource(this.id);
    }

    onDelete() {
        this.processing = true;
        this.delete$.pipe(
            tap(() => this.processing = false)
        ).subscribe(d => this.dialogRef.close(1));
    }
}
