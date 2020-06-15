import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Profile } from '../../../shared/core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { BackendService } from 'src/app/services/backend/backend.service';
import { MoneyService } from 'src/app/services/money/money.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CurrencyMinimumAmount } from '../../../shared/core/currency-minimum-amount.enum';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Balance } from '../../../shared/core/balance';
import { BalanceService } from '../../../services/balance/balance.service';
import add from 'date-fns/add';

@Component({
    selector: 'app-withdraw',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit, OnDestroy {
    unsub$ = new Subject();
    payout: FormGroup;
    user: Profile;
    stripeAccount: Observable<any>;
    balance: Observable<Balance>;
    balanceCurrencies: string[] = [];
    selectedCurrency: string;
    externalAccounts: Observable<any[]>;
    defaultAccount: Observable<any>;
    dashboardLink: Observable<string>;
    lastWithdrawl: Observable<any>;
    nextPayoutDate: Observable<number>;
    processing: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private user$: UserService,
        private money: MoneyService,
        private fb: FormBuilder,
        private backend: BackendService,
        public toast: MatSnackBar,
        private _balance: BalanceService
    ) { }

    ngOnInit() {
        // Form
        this.payout = this.fb.group({
            amount: [null, [
                Validators.required,
                Validators.min(CurrencyMinimumAmount[`${this.selectedCurrency}`.toUpperCase()])
            ]],
        });

        // Get user profile
        this.user = this.user$.profile;
        this.onCurrencyChange(this.user.defaultCurrency);

        // Get user stripe account
        this.stripeAccount = this.backend.getCurrentUserStripe().pipe(
            tap(s => console.log('Stripe account:', s))
        );
        this.externalAccounts = this.stripeAccount.pipe(
            map((s: any) => s.external_accounts.data),
            tap(e => console.log('External accounts:', e))
        );
        this.defaultAccount = this.externalAccounts.pipe(
            map((ex: any[]) => ex.find(e => e.currency == this.selectedCurrency && e.default_for_currency)),
            tap(d => console.log('Default account:', d))
        );

        // Create Stripe management link
        this.dashboardLink = this.backend.getUserDashboard().pipe(
            map(l => l.url),
            tap(l => console.log('Dashboard link:', l))
        );

        // Get User Balance
        this.balance = this._balance.get();

        // Get User Last Withdrawl
        this.lastWithdrawl = this.backend.getStripeWithdrawls().pipe(
            map(w => w.pop()),
            tap(l => console.log('Last withdrawl:', l))
        );
        this.nextPayoutDate = this.lastWithdrawl.pipe(
            map(l => add(l.created * 1000, {days: 90}).valueOf()),
            tap(n => console.log('Next payout date:', n))
        );
    }

    onCurrencyChange(value: string): void {
        console.log('New currency:', value);
        this.selectedCurrency = value;

        // TODO: Verify this will update
        // if (this.externalAccounts) {
        //     // this.defaultAccount = this.externalAccounts.find(e => e.currency == value && e.default_for_currency);
        //     // console.log(this.defaultAccount);
        // }

        let min = CurrencyMinimumAmount[`${this.selectedCurrency}`.toUpperCase()];
        console.log('Minimum to withdraw', min);
        this.payout.controls['amount'].setValidators([
            Validators.required,
            Validators.min(min)
        ]);
        this.payout.controls['amount'].updateValueAndValidity();
    }

    openDashboardLink(): void {
        this.dashboardLink.pipe(
            takeUntil(this.unsub$)
        ).subscribe(l => window.open(l));
    }

    submitPayout(): void {
        this.payout.markAllAsTouched();
        if (this.payout.invalid) {
            return;
        }

        this.processing.next(true);
        console.log('Amount:', this.money.unformat(
            this.payout.get('amount').value,
            this.selectedCurrency
        ));
        console.log('Currency:', this.selectedCurrency);

        this.backend.withdrawStripeBalance(
            this.money.unformat(this.payout.get('amount').value, this.selectedCurrency),
            this.selectedCurrency
        ).pipe(
            takeUntil(this.unsub$)
        ).subscribe(
            (payout) => {
                console.log(payout);
                this.payout.reset();
                this.toast.open(`Withdraw Complete`, 'close', { duration: 3000 });
                this.processing.next(false);
            }, (err) => {
                console.warn(err);
                this.toast.open(`Withdraw Error: ${JSON.stringify(err)}`, 'close', { duration: 3000 });
                this.processing.next(false);
            }
        );
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
