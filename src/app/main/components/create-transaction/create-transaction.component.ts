import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { BackendService } from 'src/app/services/backend/backend.service';
import { Profile } from '../../core/profile';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { from, Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { switchMap, map, catchError, tap, mergeMap, mergeMapTo } from 'rxjs/operators';
import { CurrencyMinimumAmount } from '../../core/currency-minimum-amount.enum';
import { MoneyService } from 'src/app/services/money/money.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from 'src/app/services/theme/theme.service';
declare const Stripe: any;

@Component({
    selector: 'app-create-transaction',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-transaction.component.html',
    styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit, OnDestroy {
    @ViewChild('paymentStepper') stepper: MatStepper
    paymentAmount: FormGroup;
    paymentMethod: FormGroup;
    user: Profile;
    stripe: any;
    elements: any;
    card: any;
    sepa: any;
    paymentRequest: any;
    paymentRequestButton: any;
    intent: any;
    receiver: Profile;
    newMethod: boolean = false;
    minAmount: any;
    processing: BehaviorSubject<boolean> = new BehaviorSubject(false);
    sources: Observable<any[]>;
    balance: Observable<number>;
    options: { style?: object }
    isDark$: Subscription;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private user$: UserService,
        private backend: BackendService,
        private money: MoneyService,
        private theme: ThemeService,
        public toast: MatSnackBar
    ) {}

    ngOnInit() {
        // Get user and defaults
        this.user = this.user$.profile;

        // Init stripe
        this.stripe = Stripe(environment.stripe.public_key);
        this.elements = this.stripe.elements();

        // Change style based on theme
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

        // Get payment intent from route resolver data
        this.route.data.pipe(
            map(d => d.intent),
            catchError(err => {
                console.warn(err);
                return null;
            })
        ).subscribe(i => this.intent = i);

        // Init forms
        this.paymentAmount = this.fb.group({
            amount: [null, [
                Validators.required,
                Validators.min(CurrencyMinimumAmount[`${this.user.defaultCurrency}`.toUpperCase()])
            ]],
            currency: [this.user.defaultCurrency, Validators.required],
            description: ['']
        });
        this.paymentMethod = this.fb.group({
            method: [0, Validators.required],
            saveNewMethod: [false]
        });

        // Get recipient
        this.route.queryParamMap.pipe(
            switchMap(params => this.backend.getProfile(
                params.get('to') === 'me' ? this.user.id : parseInt(params.get('to'))
            ))
        ).subscribe(u => this.receiver = u);

        // Get payment methods
        this.sources = this.backend.getUserSources();

        // Get balance
        this.balance = this.user.stripeConnectId ? this.backend.getUserBalance().pipe(
            map(b => this.money.compress(
                b.available.find(c => c.currency == this.user.defaultCurrency).amount,
                this.user.defaultCurrency
            ))
        ) : of(0);
    }

    onCurrencyChange(): void {
        this.minAmount = CurrencyMinimumAmount[`${this.paymentAmount.get('currency').value}`.toUpperCase()];
        this.paymentAmount.controls['amount'].setValidators([
            Validators.required,
            Validators.min(this.minAmount)
        ]);
        this.paymentAmount.controls['amount'].updateValueAndValidity();
        console.log('New minimum:', this.minAmount);
    }

    onMethodChange(): void {
        if (this.paymentMethod.get('method').value == 'balance') {
            this.balance.subscribe(b => {
                // Get minimum amount
                this.minAmount = CurrencyMinimumAmount[`${this.paymentAmount.get('currency').value}`.toUpperCase()];

                // Set maximum as 90% of balance - minimum
                let max = (b * 0.9) - this.minAmount;
                this.paymentAmount.controls['amount'].setValidators([
                    Validators.required,
                    Validators.min(this.minAmount),
                    Validators.max(max > 0 ? max : 0)
                ]);
                this.paymentAmount.controls['amount'].updateValueAndValidity();
                console.log('New maximum:', max);
                if (this.paymentAmount.get('amount').value > max) {
                    console.log('Going back for amount update');
                    this.stepper.previous();
                }
            })
        }
    }

    onStepChange(event: StepperSelectionEvent): void {
        console.log(event);
        if (event.selectedIndex === 1) {
            this.destroyElements();
            this.createElements();
        }
    }

    createElements(): void {
        console.log('Amount:', this.paymentAmount.get('amount').value);

        /* Card */
        this.card = this.elements.create('card', { ...this.options });
        this.card.mount('#card-element');

        /* SEPA */
        this.sepa = this.elements.create('iban', { supportedCountries: ['SEPA'], ...this.options });
        this.sepa.mount('#sepa-element');

        /* Payment Request from browser */
        this.paymentRequest = this.stripe.paymentRequest({
            country: this.user.country,
            currency: this.paymentAmount.get('currency').value,
            total: {
                label: 'NR Wallet Transfer',
                amount: this.money.unformat(
                    this.paymentAmount.get('amount').value,
                    this.paymentAmount.get('currency').value
                )
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });
        this.paymentRequestButton = this.elements.create('paymentRequestButton', {
            paymentRequest: this.paymentRequest
        });
        this.paymentRequest.canMakePayment().then((result: null | { applePay: boolean }) =>
            result ? this.paymentRequest.mount('#payment-request')
                : document.getElementById('payment-request').style.display = 'none'
        );
        this.paymentRequest.on('paymentmethod', (event) => {
            this.processing.next(true);

            this.confirmPayment(event.paymentMethod, false)
            .subscribe(confirm => {
                if (confirm.error) {
                    event.complete('fail');
                    console.warn(confirm.error);
                    this.processing.next(false);
                } else {
                    event.complete('success');
                    this.confirmPayment(event.paymentMethod)
                    .subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                }
            });
        })
    }

    destroyElements(): void {
        if (this.card) {
            this.card.destroy();
        }
        if (this.paymentRequest) {
            this.paymentRequestButton.destroy();
        }
        if (this.sepa) {
            this.sepa.destroy();
        }
        this.paymentRequest = null;
    }

    createPaymentMethod(): Observable<any> {
        console.log('Creating payment method');

        return from(this.stripe.createPaymentMethod({
            type: 'card',
            card: this.card
        }))
    }

    submitPayment(): void {
        // TODO: Handle failed payment properly
        console.log('Save new method', this.paymentMethod.get('saveNewMethod').value)
        this.processing.next(true);

        switch (this.paymentMethod.get('method').value) {
            case 'new':
                // Attempt creating payment method
                this.createPaymentMethod().pipe(
                    // Log payment
                    tap(() => console.log('Making payment with new card')),

                    // Map to error or payment method
                    map(({ paymentMethod, error }) => {
                        if (error) throw new Error(error);
                        return paymentMethod;
                    }),

                    // Map to payment confirmation if no error
                    switchMap(pm => this.confirmPayment(pm))
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            case 'sepa':
                // Confirm payment
                this.confirmPayment(this.sepa, true, 'sepa')
                .pipe(tap(() => console.log('Making SEPA payment')))
                .subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            case 'balance':
                // Confirm payment
                this.confirmPayment(null, true, 'balance')
                .pipe(tap(() => console.log('Making balance payment')))
                .subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            default:
                // Confirm payment
                this.sources.pipe(
                    // Map to correct payment method
                    map(s => s[this.paymentMethod.get('method').value]),

                    // Do payment confirmation
                    switchMap(pm => this.confirmPayment(pm).pipe(tap(() => console.log('Making card payment'))))
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;
        }
    }

    confirmPayment(payment_method: any, handleActions = true, type = 'card'): Observable<any> {
        // Update PaymentIntent with correct amount to server
        return this.backend.updateIntent(
            this.intent.id,
            this.money.unformat(
                this.paymentAmount.get('amount').value,
                this.paymentAmount.get('currency').value
            ),
            this.paymentAmount.get('currency').value,
            this.paymentAmount.get('description').value
        ).pipe(
            tap(i => console.log('Intent updated:', i)),
            mergeMap(intent => {
                switch (type) {
                    case 'sepa':
                        return from(this.stripe.confirmSepaDebitPayment(
                            intent.client_secret, {
                                payment_method: {
                                    sepa_debit: payment_method,
                                    billing_details: {
                                        email: this.user.email,
                                        name: this.user.name || this.user.username
                                    }
                                },
                                save_payment_method:
                                    this.paymentMethod.get('method').value === 'sepa'
                                    && this.paymentMethod.get('saveNewMethod').value,
                            }, { handleActions }
                        ));

                    case 'card':
                        return from(this.stripe.confirmCardPayment(
                            intent.client_secret, {
                                payment_method: payment_method.id,
                                receipt_email: this.user.email,
                                save_payment_method:
                                    this.paymentMethod.get('method').value === 'new'
                                    && this.paymentMethod.get('saveNewMethod').value,
                            }, { handleActions }
                        ));

                    case 'balance':
                    default:
                        return of({ paymentIntent: intent });
                }
            }),
            tap(i => console.log('Intent confirmation returned', i)),
            map((r: any) => {
                if (r.error) {
                    throw r.error
                }
                return r
            })
        );
    }

    onSuccess({ paymentIntent }): void {
        console.log('Completed:', paymentIntent);

        let type: string;
        switch (this.paymentMethod.get('method').value) {
            case 'sepa':
                type = 'sepa';
                break;

            case 'balance':
                type = 'balance';
                break;

            case 'new':
            default:
                type = 'card';
                break;
        }

        this.backend.confirmPayment({
            'amount': paymentIntent.amount,
            'currency': paymentIntent.currency,
            'description': paymentIntent.description,
            'stripe_transaction_id': paymentIntent.id,
            'status': paymentIntent.status,
            'type': type,
            'for_user_id': this.receiver
        }).subscribe(console.log);

        // Show success toast
        this.processing.next(false);
        this.toast.open(`Transaction Complete`, 'close', { duration: 3000 });
        this.router.navigate(['/']);
    }

    // Handle Error
    onFailed(error: any): void {
        this.processing.next(false);
        this.toast.open(`Error: ${error.message}`, 'close', { duration: 3000 });
        console.warn(error);
    }

    ngOnDestroy(): void {
        this.destroyElements();
        this.isDark$.unsubscribe();
    }
}
