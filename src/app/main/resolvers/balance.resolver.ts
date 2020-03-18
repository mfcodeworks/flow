import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { BackendService } from '../../services/backend/backend.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { filter, mergeMap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user/user.service';

@Injectable()
export class BalanceResolver implements Resolve<any[]> {

    constructor(
        private backend: BackendService,
        private auth: AuthService,
        private user: UserService
    ) { }

    resolve(): Observable<any[]> {
        // Require account with Stripe Connect ID
        return this.auth.isLoggedIn().pipe(
            filter(l => l),
            filter(() => !!this.user.profile.stripeConnectId),
            mergeMap(() => this.backend.getUserBalance())
        );
    }
}
