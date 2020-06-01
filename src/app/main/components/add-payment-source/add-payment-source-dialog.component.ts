import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';
import { Profile } from '../../../shared/core/profile';
import { BackendService } from 'src/app/services/backend/backend.service';
import { map, tap, mergeMap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { ThemeService } from '../../../services/theme/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';

declare const Stripe: any;

export interface AddPaymentMethodData {
    success: boolean;
}

@Component({
    selector: 'app-add-payment-source',
    templateUrl: './add-payment-source-dialog.component.html',
    styleUrls: ['./add-payment-source-dialog.component.scss']
})
export class AddPaymentSourceDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    user: Profile;
    type: string = 'card';
    stripe: any;
    elements: any;
    card: any;
    sepa: any;
    ideal: any;
    processing = false;
    options: { style?: object }
    isDark$: Subscription;

    constructor(
        private user$: UserService,
        private backend: BackendService,
        private theme: ThemeService,
        public dialogRef: MatDialogRef<void>,
        public toast: MatSnackBar
    ) {}

    ngOnInit() {
        console.log('Loading add source component');
        this.user = this.user$.profile;
        console.log(this.user);
        this.stripe = Stripe(environment.stripe.public_key, {
            // stripeAccount: this.user.stripeConnectId
        });
        console.log(this.stripe);
        this.elements = this.stripe.elements();
        this.isDark$ = this.theme.isDarkMode().subscribe(d => {
            console.log('Is dark:', d);
            this.options = !!d ? {
                style: {
                    base: {
                        color: '#ffffff',
                        iconColor: '#ffffff',
                        ':-webkit-autofill': {
                            color: '#ffffff',
                            backgroundColor: '#ffffff'
                        },
                        '::placeholder': {
                            color: '#ffffff',
                        },
                    }
                }
            } : {};
        });
    }

    ngAfterViewInit() {
        console.log('Creating add source component');
        this.createElements()
    }

    createElements() {
        this.card = this.elements.create('card', { ...this.options });
        this.card.mount('#card-element');
        this.sepa = this.elements.create('iban', { supportedCountries: ['SEPA'], ...this.options });
        this.sepa.mount('#sepa-element');
    }

    async createPaymentMethod() {
        console.log('Creating payment method');
        this.processing = true;

        from(this.stripe.createPaymentMethod({
            type: this.type,
            card: this.card
        })).pipe(
            // Get stripe reply and determine if error
            map(({ paymentMethod, error}) => {
                if (error) {
                    throw new Error(error)
                }
                return paymentMethod
            }),
            // Log payment method
            tap(console.log),
            // Save payment method
            mergeMap((pm) => this.backend.saveUserSource(pm)),
            // Log save method reply
            tap(console.log),
        ).subscribe(
            () => {
                this.toast.open('New Source Saved Successfully', 'close', { duration: 3000 });
                this.processing = false;
                this.dialogRef.close(true);
            },
            error => {
                this.toast.open(`Error Occured: ${JSON.stringify(error)}`, 'close', { duration: 3000 });
                this.processing = false;
                console.warn(error);
            }
        );

        // FIXME: Get SetupIntent for SEPA
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    ngOnDestroy(): void {
        if (this.card) {
            this.card.destroy();
        }
        if (this.sepa) {
            this.sepa.destroy();
        }
        this.isDark$.unsubscribe();
    }
}
