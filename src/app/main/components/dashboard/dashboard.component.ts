import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { SHA256, enc } from 'crypto-js';
import { Profile } from '../../core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend/backend.service';
import { Transaction } from '../../core/transaction';
import { map, tap, distinctUntilChanged, filter } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddPaymentSourceDialogComponent } from '../add-payment-source/add-payment-source-dialog.component';
import { PaymentSourceDialogComponent } from '../payment-source-dialog/payment-source-dialog.component';
import { BalanceService } from '../../../services/balance/balance.service';
import { Balance } from '../../core/balance';
import { TransactionsService } from '../../../services/transactions/transactions.service';
import { SourcesService } from '../../../services/sources/sources.service';

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

    constructor(
        private _user: UserService,
        private backend: BackendService,
        public dialog: MatDialog,
        private _balance: BalanceService,
        private _transactions: TransactionsService,
        private _sources: SourcesService
    ) { }

    ngOnInit() {
        this.user = this._user.profile;
        this.loginLink = `https://connect.stripe.com/express/oauth/authorize?redirect_uri=http://localhost:4200/wallet/signup/stripe&client_id=${environment.stripe.client_id}&state=${SHA256(this.user.toString(), environment.stripe.public_key).toString(enc.Hex)}&scope=read&write`;
        this.qrData = `${environment.appUrl}/profile/${this.user.id}`;

        // Get User Dashboard or Login Link
        if (this.user.stripeConnectId) {
            this.dashboardLink = this.backend.getUserDashboard().pipe(
                map(l => l.url),
                tap(l => console.log('Dashboard link:', l))
            );
        } else {
            Browser.prefetch({urls: [this.loginLink]});
        }
    }

    getBalance(): BehaviorSubject<Balance|null> {
        return this._balance.get();
    }

    getTransactions(): Observable<Transaction[]> {
        return this._transactions.get().pipe(
            distinctUntilChanged(),
            filter(t => !!t),
            map(t => Array.prototype.concat(t.sent, t.received))
        );
    }

    getSources(): BehaviorSubject<any[]|null> {
        return this._sources.get();
    }

    refresh(ev: any): void {
        this._balance.refresh();
        this._sources.refresh();
        this._transactions.refresh();
        setTimeout(() => ev.target.complete(), 1500);
    }

    openSourceDialog(id: string): void {
        // Open payment source dialog
        const dialogRef = this.dialog.open(PaymentSourceDialogComponent, {
            data: { paymentMethod: id }
        });

        // Handle dialog close (success/cancel), if success then refresh sources
        dialogRef.afterClosed().subscribe(success => !!success && this._sources.refresh());
    }

    openAddNewSource(): void {
        // Open add payment source dialog
        const dialogRef = this.dialog.open(AddPaymentSourceDialogComponent, { width: '600px' });

        // Handle dialog close (success/cancel), if success then refresh sources
        dialogRef.afterClosed().subscribe(success => !!success && this._sources.refresh());
    }

    // Open login link in browser window
    async openLoginLink(): Promise<void> {
        await Browser.open({url: this.loginLink});
    }

    // Open dashboard link in browser window
    openDashboardLink(): void {
        this.dashboardLink.subscribe(async l => await Browser.open({url: l}));
    }
}
