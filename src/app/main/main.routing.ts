import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { SignedInGuard } from '../shared/guards/signed-in.guard';
import { PaymentIntentResolver } from '../main/resolvers/payment-intent.resolver'
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StripeSignupComponent } from './components/stripe-signup/stripe-signup.component';
import { CreateTransactionComponent } from './pages/create-transaction/create-transaction.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { WithdrawComponent } from './pages/withdraw/withdraw.component';
import { SearchComponent } from './pages/search/search.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TransactionComponent } from './pages/transaction/transaction.component';

export const routes: Routes = [
    {
        path: 'profile/:profile',
        component: ProfileComponent
    },
    {
        path: 'transaction/create',
        component: CreateTransactionComponent,
        resolve: { intent: PaymentIntentResolver }
    },
    {
        path: 'transaction/:id',
        component: TransactionComponent
    },
    {
        path: '',
        canActivateChild: [SignedInGuard],
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'search',
                component: SearchComponent
            },
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'withdraw',
                component: WithdrawComponent
            },
            {
                path: 'signup/stripe',
                component: StripeSignupComponent
            }
        ]
    }
];

export const Routing: ModuleWithProviders = RouterModule.forChild(routes);
