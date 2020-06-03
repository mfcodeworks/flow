import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { BackendService } from 'src/app/services/backend/backend.service';
import { tap, mergeMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddPaymentSourceComponent } from '../add-payment-source/add-payment-source.component';
import { BehaviorSubject } from 'rxjs';
import { ModalController } from '@ionic/angular';

export interface AddPaymentMethodData {
    success: boolean;
}

@Component({
    selector: 'app-add-payment-source-dialog',
    templateUrl: './add-payment-source-dialog.component.html',
    styleUrls: ['./add-payment-source-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPaymentSourceDialogComponent {

    @ViewChild('stripeElement', {static: false}) stripeElement: AddPaymentSourceComponent;
    processing =  new BehaviorSubject<boolean>(false)

    constructor(
        private backend: BackendService,
        public dialogRef: ModalController,
        public toast: MatSnackBar
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
        ).subscribe(
            () => {
                this.toast.open('New Source Saved Successfully', 'close', { duration: 3000 });
                this.processing.next(false);
                this.close(true);
            },
            error => {
                this.toast.open(`Error Saving Card`, 'close', { duration: 3000 });
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
}
