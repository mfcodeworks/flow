import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { IonicModule } from '@ionic/angular';

import { Routing } from './main.routing';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { DateDiffPipe } from '../main/pipes/date-diff.pipe';
import { CurrencySymbolPipe } from '../main/pipes/currency-symbol.pipe';
import { AddPaymentSourceDialogComponent } from './components/add-payment-source/add-payment-source-dialog.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StripeSignupComponent } from './components/stripe-signup/stripe-signup.component';
import { CreateTransactionComponent } from './pages/create-transaction/create-transaction.component';
import { PaymentIntentResolver } from 'src/app/main/resolvers/payment-intent.resolver';
import { QRComponent } from './components/qr/qr.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { WithdrawComponent } from './pages/withdraw/withdraw.component';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { SearchComponent } from './pages/search/search.component';
import { QuotesComponent } from './components/quotes/quotes.component';
import { DateFilterPipe } from '../main/pipes/date-filter.pipe';
import { SettingsComponent } from './pages/settings/settings.component';
import { ZoomSettingsComponent } from './components/zoom-settings/zoom-settings.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ThemeSettingsComponent } from './components/theme-settings/theme-settings.component';
import { EncryptLoginComponent } from './components/encrypt-login/encrypt-login.component';
import { EncryptLoginDialogComponent } from './components/encrypt-login/encrypt-login-dialog/encrypt-login-dialog.component';
import { PaymentSourceDialogComponent } from './components/payment-source-dialog/payment-source-dialog.component';
import { TransactionComponent } from './pages/transaction/transaction.component';
import { MoneyPipe } from './pipes/money.pipe';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(),
        MaterialModule,
        SharedModule,
        OverlayModule,
        ReactiveFormsModule,
        Routing
    ],
    declarations: [
        DateDiffPipe,
        DateFilterPipe,
        CurrencySymbolPipe,
        BalanceDisplayComponent,
        AddPaymentSourceDialogComponent,
        TransactionListComponent,
        DashboardComponent,
        StripeSignupComponent,
        CreateTransactionComponent,
        QRComponent,
        ProfileComponent,
        WithdrawComponent,
        SearchComponent,
        QuotesComponent,
        SettingsComponent,
        ZoomSettingsComponent,
        UserSettingsComponent,
        ThemeSettingsComponent,
        EncryptLoginComponent,
        EncryptLoginDialogComponent,
        PaymentSourceDialogComponent,
        TransactionComponent,
        MoneyPipe
    ],
    providers: [
        PaymentIntentResolver
    ]
})
export class MainModule {}
