import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Plugins } from '@capacitor/core';
import SHA256 from "crypto-js/sha256";
import Hex from 'crypto-js/enc-hex';
import { Profile } from '../../../shared/core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend/backend.service';
import { map, tap, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { AddPaymentSourceDialogComponent } from '../../components/add-payment-source-dialog/add-payment-source-dialog.component';
import { PaymentSourceDialogComponent } from '../../components/payment-source-dialog/payment-source-dialog.component';
import { BalanceService } from '../../../services/balance/balance.service';
import { TransactionsService } from '../../../services/transactions/transactions.service';
import { SourcesService } from '../../../services/sources/sources.service';
import { ModalController } from '@ionic/angular';

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
    balance$ = this._balance.get();
    sources$ = this._sources.get();
    transactions$ = this._transactions.get().pipe(
        distinctUntilChanged(),
        filter(t => !!t),
        map(t => Array.prototype.concat(t.sent, t.received))
    );

    constructor(
        private _user: UserService,
        private backend: BackendService,
        public dialog: ModalController,
        private _balance: BalanceService,
        private _transactions: TransactionsService,
        private _sources: SourcesService
    ) { }

    ngOnInit() {
        this.user = this._user.profile;
        this.loginLink = `https://connect.stripe.com/express/oauth/authorize?redirect_uri=http://localhost:4200/wallet/signup/stripe&client_id=${environment.stripe.client_id}&state=${SHA256(this.user.toString(), environment.stripe.public_key).toString(Hex)}&scope=read&write`;
        this.qrData = `${environment.appUrl}/profile/${this.user.id}`;

        // Get User Dashboard or Login Link
        this.user.stripeConnectId
            ? this.dashboardLink = this.backend.getUserDashboard().pipe(
                map(l => l.url),
                tap(l => console.log('Dashboard link:', l))
            ) : Browser.prefetch({urls: [this.loginLink]});
    }

    refresh(ev: any): void {
        this._balance.refresh();
        this._sources.refresh();
        this._transactions.refresh();
        setTimeout(() => ev.target.complete(), 1500);
    }

    async openSourceDialog(id: string): Promise<void> {
        // Open payment source dialog
        const dialogRef = await this.dialog.create({
            component: PaymentSourceDialogComponent,
            componentProps: {paymentMethod: id},
            cssClass: 'narrow-dialog'
        });
        await dialogRef.present();

        // Handle dialog close (success/cancel), if success then refresh sources
        from(dialogRef.onWillDismiss()).pipe(
            take(1)
        ).subscribe(
            ({data: {success} = {success: false}}) => !!success && this._sources.refresh()
        );
    }

    async openAddNewSource(): Promise<void> {
        // Open add payment source dialog
        const dialogRef = await this.dialog.create({
            component: AddPaymentSourceDialogComponent,
            cssClass: 'narrow-dialog'
        });
        await dialogRef.present();

        // Handle dialog close (success/cancel), if success then refresh sources
        from(dialogRef.onWillDismiss()).pipe(
            take(1)
        ).subscribe(
            ({data: {success} = {success: false}}) => !!success && this._sources.refresh()
        );
    }

    // Open login link in browser window
    async openLoginLink(): Promise<void> {
        await Browser.open({url: this.loginLink});
    }

    // Open dashboard link in browser window
    openDashboardLink(): void {
        this.dashboardLink.pipe(
            take(1)
        ).subscribe(async l => await Browser.open({url: l}));
    }
}
