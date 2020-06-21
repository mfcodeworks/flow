import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { BackendService } from 'src/app/services/backend/backend.service';
import { tap, mergeMap, takeUntil } from 'rxjs/operators';
import { AddPaymentSourceComponent } from '../add-payment-source/add-payment-source.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModalController, ToastController } from '@ionic/angular';

export interface AddPaymentMethodData {
    success: boolean;
}

@Component({
    selector: 'app-add-payment-source-dialog',
    templateUrl: './add-payment-source-dialog.component.html',
    styleUrls: ['./add-payment-source-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPaymentSourceDialogComponent implements OnDestroy {

    @ViewChild('stripeElement', {static: false}) stripeElement: AddPaymentSourceComponent;
    unsub$ = new Subject();
    processing =  new BehaviorSubject<boolean>(false)

    constructor(
        private backend: BackendService,
        public dialogRef: ModalController,
        public toast: ToastController
    ) {}

    async createPaymentMethod() {
        console.log('Creating payment method');
        this.processing.next(true);

        this.stripeElement.createPaymentMethod().pipe(
            // Log payment method
            tap(console.log),
            // Save payment method
            mergeMap((pm) => this.backend.saveUserSource(pm)),
            // Log save method reply
            tap(console.log),
            takeUntil(this.unsub$)
        ).subscribe(
            () => {
                this.toast.create({
                    header: 'New Source Saved Successfully',
                    duration: 3000
                }).then(t => t.present())
                this.processing.next(false);
                this.close(true);
            },
            error => {
                this.toast.create({
                    header: `Error Saving Card`,
                    duration: 3000
                }).then(t => t.present())
                this.processing.next(false);
                console.warn(error);
            }
        );
    }

    onCancel(): void {
        this.close(false);
    }

    close(success = false): void {
        this.dialogRef.dismiss({success});
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
