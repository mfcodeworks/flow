import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { SHA256, enc } from 'crypto-js';
import { Profile } from '../../core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend/backend.service';
import { Transaction } from '../../core/transaction';
import { map, tap, mergeMap, filter } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddPaymentSourceDialogComponent } from '../add-payment-source/add-payment-source-dialog.component';
import { PaymentSourceDialogComponent } from '../payment-source-dialog/payment-source-dialog.component';
import { BalanceService } from '../../../services/balance/balance.service';
import { Balance } from '../../core/balance';

const { Browser } = Plugins;

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    loginLink: string;
    user: Profile;
    qrData: string;
    dashboardLink: Observable<string>;
    transactions: Observable<Transaction[]>;
    balance: Observable<Balance>;
    sources: Observable<any[]>;
    refreshCount = 0;
    trigger$: BehaviorSubject<any> = new BehaviorSubject(this.refreshCount);

    constructor(
        private _user: UserService,
        private backend: BackendService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private _balance: BalanceService
    ) { }

    ngOnInit() {
        // console.log(this._user);
        this.user = this._user.profile;
        // console.log(this.user);
        this.loginLink = `https://connect.stripe.com/express/oauth/authorize?redirect_uri=http://localhost:4200/wallet/signup/stripe&client_id=${environment.stripe.client_id}&state=${SHA256(this.user.toString(), environment.stripe.public_key).toString(enc.Hex)}&scope=read&write`;
        this.qrData = `${environment.appUrl}/profile/${this.user.id}`;

        // Get transactions
        this.transactions = this.route.data.pipe(
            tap(d => console.log('Transactions', d)),
            map(d => d.transactions),
            map(t => Array.prototype.concat(t.sent, t.received))
        );

        // Get User Sources
        this.sources = this.trigger$.pipe(
            mergeMap(() => this.backend.getUserSources()),
            tap(() => console.log('Dashboard received new sources')),
            tap(s => console.log('Sources:', s))
        );

        if (this.user.stripeConnectId) {
            // Get User Balance
            // this.balance = this.route.data.pipe(
            //     filter(d => d.balances),
            //     map(d => d.balances)
            // );

            // Get User Dashboard Link
            this.dashboardLink = this.backend.getUserDashboard().pipe(
                map(l => l.url),
                tap(l => console.log('Dashboard link:', l))
            );
        } else {
            Browser.prefetch({urls: [this.loginLink]});
        }
    }

    getBalance(): Subject<Balance> {
        return this._balance.get();
    }

    refresh(ev: any): void {
        this._balance.refresh();
        this.trigger$.next(this.refreshCount++);
        setTimeout(() => ev.target.complete(), 1500);
    }

    openSourceDialog(id: string): void {
        // Open payment source dialog
        const dialogRef = this.dialog.open(PaymentSourceDialogComponent, {
            data: { paymentMethod: id }
        });

        // Handle dialog close (success/cancel)
        dialogRef.afterClosed().subscribe(success => {
            if (success) {
                this.trigger$.next(1);
            }
        });
    }

    openAddNewSource(): void {
        // Open add payment source dialog
        const dialogRef = this.dialog.open(AddPaymentSourceDialogComponent, { width: '600px' });

        // Handle dialog close (success/cancel)
        dialogRef.afterClosed().subscribe(success => {
            if (success) {
                this.trigger$.next(1);
            }
        });
    }

    async openLoginLink(): Promise<void> {
        await Browser.open({url: this.loginLink});
    }

    openDashboardLink(): void {
        this.dashboardLink.subscribe(async l => await Browser.open({url: l}));
    }
}
