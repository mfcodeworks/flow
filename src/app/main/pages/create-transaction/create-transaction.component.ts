import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { BackendService } from 'src/app/services/backend/backend.service';
import { Profile } from '../../../shared/core/profile';
import { ActivatedRoute } from '@angular/router';
import { from, Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { switchMap, map, catchError, tap, mergeMap, filter, takeUntil } from 'rxjs/operators';
import { CurrencyMinimumAmount } from '../../../shared/core/currency-minimum-amount.enum';
import { MoneyService } from 'src/app/services/money/money.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { ModalController, ToastController } from '@ionic/angular';
import { TransactionComponent } from '../transaction/transaction.component';
import { PaymentService } from '../../../services/payment/payment.service';

@Component({
    selector: 'app-create-transaction',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-transaction.component.html',
    styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit, OnDestroy {
    @ViewChild('paymentStepper') stepper: MatStepper
    unsub$ = new Subject();
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
    sources: Observable<any>;
    balance = of(0).pipe(
        filter(() => !!this.user?.stripeConnectId),
        switchMap(() => this.backend.getUserBalance()),
        map(b => this.money.compress(
            b.available.find(c => c.currency == this.user.defaultCurrency).amount,
            this.user.defaultCurrency
        ))
    );
    options: {style?: object};

    constructor(
        private dialogRef: ModalController,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private user$: UserService,
        private backend: BackendService,
        private money: MoneyService,
        private theme: ThemeService,
        private payment: PaymentService,
        public toast: ToastController
    ) {}

    ngOnInit(): void {
        // Get theme
        this.theme.isDarkMode().pipe(
            takeUntil(this.unsub$)
        ).subscribe(d => {
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

        // Get user
        this.user = this.user$.profile;

        this.sources = of(!!this.user).pipe(
            filter(u => u),
            switchMap(() => this.backend.getUserSources())
        );

        // Init stripe
        this.stripe = this.payment.stripe;
        this.elements = this.payment.elements;

        // Get payment intent from route resolver data
        this.route.data.pipe(
            map(d => d.intent),
            catchError(err => {
                console.warn(err);
                return null;
            }),
            map(i => this.intent = i),
            takeUntil(this.unsub$)
        ).subscribe();

        // Get recipient
        this.route.queryParamMap.pipe(
            switchMap(params => this.backend.getProfile(
                params.get('to') === 'me' ? this.user.id : parseInt(params.get('to'))
            )),
            map(u => this.receiver = u),
            takeUntil(this.unsub$)
        ).subscribe();

        // Init forms
        this.paymentAmount = this.fb.group({
            amount: [
                null, [
                    Validators.required,
                    Validators.min(
                        CurrencyMinimumAmount[
                            `${this.user?.defaultCurrency || 'aud'}`.toUpperCase()
                        ]
                    )
                ]
            ],
            currency: [(this.user?.defaultCurrency || 'aud'), Validators.required],
            description: ['']
        });

        this.paymentMethod = this.fb.group({
            method: [!!this.user ? 0 : 'new', Validators.required],
            saveNewMethod: [{value: false, disabled: !this.user}]
        });
    }

    onCurrencyChange(): void {
        // Get minimum amount for new currency
        this.minAmount = CurrencyMinimumAmount[
            `${this.paymentAmount.get('currency').value}`.toUpperCase()
        ];

        // Update amount with currency minimums
        this.paymentAmount.controls['amount'].setValidators([
            Validators.required,
            Validators.min(this.minAmount)
        ]);

        // Update form
        this.paymentAmount.controls['amount'].updateValueAndValidity();

        // DEBUG: Log new minimum
        console.log('New minimum:', this.minAmount);
    }

    onMethodChange(): void {
        // Only handle balance
        if (this.paymentMethod.get('method').value !== 'balance')
            return;

        // Perform balance checks and updates
        this.balance.pipe(
            // Set maximum amount
            map(b => (b * 0.9) - this.minAmount),
            // Set maximum amount on form
            tap(max => this.paymentAmount.controls['amount'].setValidators([
                Validators.required,
                Validators.min(this.minAmount),
                Validators.max(max > 0 ? max : 0)
            ])),
            // Update form
            tap(_ => this.paymentAmount.controls['amount'].updateValueAndValidity()),
            // DEBUG: Log new maximum
            tap(max => console.log('New maximum:', max)),
            // If amount higher than allowed max, set form back
            tap(max => this.paymentAmount.get('amount').value >= max && this.stepper.previous()),
            takeUntil(this.unsub$)
        ).subscribe();
    }

    onStepChange(event: StepperSelectionEvent): void {
        console.log(this.paymentMethod.controls);
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
            country: this.user?.country || 'AU',
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
            .pipe(takeUntil(this.unsub$))
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
        this.card?.destroy();
        this.paymentRequestButton?.destroy();
        this.sepa?.destroy();
        this.paymentRequest = null;
    }

    createPaymentMethod(): Observable<any> {
        console.log('Creating payment method');

        return from(
            this.stripe.createPaymentMethod({
                type: 'card',
                card: this.card
            })
        );
    }

    // TODO: Handle failed payment properly, move to payment service
    submitPayment(): void {
        console.log('Save new method', this.paymentMethod.get('saveNewMethod').value)
        this.processing.next(true);

        switch (this.paymentMethod.get('method').value) {
            case 'new':
                // Attempt creating payment method
                this.createPaymentMethod().pipe(
                    // Log payment
                    tap(_ => console.log('Making payment with new card')),

                    // Map to error or payment method
                    map(({ paymentMethod, error }) => {
                        if (error) throw new Error(error);
                        return paymentMethod;
                    }),

                    // Map to payment confirmation if no error
                    switchMap(pm => this.confirmPayment(pm))
                ).pipe(
                    takeUntil(this.unsub$)
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            case 'sepa':
                // Confirm payment
                this.confirmPayment(this.sepa, true, 'sepa').pipe(
                    tap(_ => console.log('Making SEPA payment')),
                    takeUntil(this.unsub$)
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            case 'balance':
                // Confirm payment
                this.confirmPayment(null, true, 'balance')
                .pipe(
                    tap(_ => console.log('Making balance payment')),
                    takeUntil(this.unsub$)
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;

            default:
                // Confirm payment
                this.sources.pipe(
                    // Map to correct payment method
                    map(s => s[this.paymentMethod.get('method').value]),

                    // Do payment confirmation
                    switchMap(pm => this.confirmPayment(pm).pipe(tap(_ => console.log('Making card payment')))),
                    takeUntil(this.unsub$)
                ).subscribe(this.onSuccess.bind(this), this.onFailed.bind(this));
                break;
        }
    }

    // TODO: Move to payment service
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
                                receipt_email: this.user?.email,
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

    // TODO: Move to payment service
    onSuccess({paymentIntent}): void {
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
        }).pipe(
            takeUntil(this.unsub$)
        ).subscribe(async _ => {
            // Reset form
            this.processing.next(false);
            this.stepper.previous();

            // Show transaction after reset complete
            await this.dialogRef.create({
                component: TransactionComponent,
                componentProps: {
                    id: paymentIntent.id
                }
            }).then(tx => tx.present());
        });
    }

    // Handle Error
    onFailed(error: any): void {
        this.processing.next(false);
        this.toast.create({
            header: `Error: ${error.message}`,
            duration: 3000
        }).then(t => t.present());
        console.warn(error);
    }

    ngOnDestroy(): void {
        this.destroyElements();
        this.unsub$.next();
        this.unsub$.complete();
    }
}
