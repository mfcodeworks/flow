import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { SignedInGuard } from '../shared/guards/signed-in.guard';
import { PaymentIntentResolver } from '../main/resolvers/payment-intent.resolver'
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StripeSignupComponent } from './components/stripe-signup/stripe-signup.component';
import { CreateTransactionComponent } from './components/create-transaction/create-transaction.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileResolver } from '../main/resolvers/profile.resolver';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';

/* TODO: Don't require SignedIn for Profile and CreateTransaction */
export const routes: Routes = [
    {
        path: '',
        canActivateChild: [ SignedInGuard ],
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
            },
            {
                path: 'profile/:profile',
                component: ProfileComponent,
                resolve: { profile: ProfileResolver },
                runGuardsAndResolvers: 'always'
            },
            {
                path: 'transaction/create',
                component: CreateTransactionComponent,
                resolve: { intent: PaymentIntentResolver },
                runGuardsAndResolvers: 'always'
            }
        ]
    }
];

export const Routing: ModuleWithProviders = RouterModule.forChild(routes);
