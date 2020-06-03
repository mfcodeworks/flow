import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from 'src/app/services/backend/backend.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

export interface PaymentMethodDialogData {
    paymentMethod: string;
}

@Component({
    selector: 'app-payment-source-dialog',
    templateUrl: './payment-source-dialog.component.html',
    styleUrls: ['./payment-source-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentSourceDialogComponent implements OnInit {
    @Input() paymentMethod: string;
    source$: Observable<any>;
    delete$: Observable<boolean>;
    processing = new BehaviorSubject<boolean>(false);
    title = new BehaviorSubject<string>('');
    loaded = new BehaviorSubject<boolean>(false);

    constructor(
        private _backend: BackendService,
        public dialogRef: ModalController
    ) {}

    ngOnInit(): void {
        this.source$ = this._backend.getUserSource(this.paymentMethod).pipe(
            tap(pm => this.title.next(pm?.card?.brand)),
            tap(_ => this.loaded.next(true))
        );
        this.delete$ = this._backend.deleteUserSource(this.paymentMethod);
    }

    onDelete() {
        this.processing.next(true);
        this.delete$.pipe(
            tap(_ => this.processing.next(false))
        ).subscribe(_ => this.close(true));
    }

    close(success = false) {
        this.dialogRef.dismiss({success});
    }
}
