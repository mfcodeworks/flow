import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { SignedOutGuard } from '../shared/guards/signed-out.guard';

export const routes: Routes = [
    {
        path: '',
        canActivateChild: [ SignedOutGuard ],
        children: [
            {
                path: 'login',
                component: SignInComponent
            },
            {
                path: 'register',
                component: SignUpComponent
            },
            {
                path: 'authorize',
                component: AuthorizeComponent
            },
            {
                path: 'password/reset/:token',
                component: ResetPasswordComponent
            },
            {
                path: 'password/reset',
                component: ForgotPasswordComponent
            }
        ]
    }
];

export const Routing: ModuleWithProviders = RouterModule.forChild(routes);
