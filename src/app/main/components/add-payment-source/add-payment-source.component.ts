import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ChangeDetectionStrategy
} from '@angular/core';
import { from, Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ThemeService } from '../../../services/theme/theme.service';
import { ToastController } from '@ionic/angular';

declare const Stripe: any;

@Component({
    selector: 'app-add-payment-source',
    templateUrl: './add-payment-source.component.html',
    styleUrls: ['./add-payment-source.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPaymentSourceComponent implements OnInit, AfterViewInit, OnDestroy {
    // Method options
    type: string = 'card';
    types: {name: string; value: string}[] = [
        {
            name: 'Debit/Credit Card',
            value: 'card'
        },
        // FIXME: Implement IBAN
        // {
        //     name: 'Bank (SEPA)',
        //     value: 'iban'
        // }
    ];

    // Stripe options
    stripe: any;
    elements: any;
    options: {style?: object}
    isDark$: Subscription;

    // Method types
    card: any;
    sepa: any;

    constructor(private theme: ThemeService) {}

    ngOnInit() {
        console.log('Loading add source component');

        this.stripe = Stripe(environment.stripe.public_key);
        console.log(this.stripe);

        this.elements = this.stripe.elements();
        console.log(this.elements);

        this.isDark$ = this.theme.isDarkMode().subscribe(d =>
            this.options = !!d
                ? {
                    style: {
                        base: {
                            color: '#ffffff',
                            iconColor: '#ffffff',
                            ':-webkit-autofill': {
                                color: '#ffffff',
                                backgroundColor: '#ffffff'
                            },
                            '::placeholder': {color: '#ffffff'}
                        }
                    }
                } : {}
        );
    }

    ngAfterViewInit() {
        console.log('Creating add source component');
        this.createElements();
    }

    createElements() {
        console.log('Initializing element', this.type);
        this.destroyElements();

        // Initialize payment method input
        switch (this.type) {
            case 'card':
                console.log('Init card');
                this.card = this.elements.create('card', {...this.options});
                this.card.mount('#card-element');
                console.log(this.card);
                break;

            case 'iban':
                console.log('Init sepa');
                this.sepa = this.elements.create('iban', {supportedCountries: ['SEPA'], ...this.options});
                this.sepa.mount('#sepa-element');
                console.log(this.sepa);
                break;
        }
    }

    destroyElements(): void {
        this.card?.destroy();
        this.sepa?.destroy();
    }

    createPaymentMethod(): Observable<PaymentMethodData> {
        const elementInput = {
            type: this.type,
            card: this.card,
            sepa_debit: this.sepa
        }

        // Create Stripe payment method from element
        return from(this.stripe.createPaymentMethod(elementInput))
            .pipe(
                map(({paymentMethod, error}) => {
                    if (error) {
                        throw new Error(error)
                    }

                    return paymentMethod
                })
            );
    }

    ngOnDestroy(): void {
        console.log('Destroying modal');
        this.destroyElements();
        this.isDark$?.unsubscribe();
    }
}
