import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SHA256, enc } from 'crypto-js';

import { BackendService } from '../../services/backend/backend.service';
import { UserService } from '../../services/user/user.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class PaymentIntentResolver implements Resolve<Observable<any>> {

    constructor(
        private user$: UserService,
        private backend: BackendService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        let for_user_id = route.queryParamMap.get('to') === 'me' ? this.user$.profile.id : parseInt(route.queryParamMap.get('to'))
        let nonce = SHA256(
            `${this.user$.profile.id}${this.user$.profile.username}${new Date().getTime()}`,
            environment.stripe.public_key
        ).toString(enc.Hex);

        console.log(for_user_id, nonce);

        return this.backend.getIntent(for_user_id, nonce).pipe(
            catchError((error) => {
                this.router.navigate(['/']);
                return of(error);
            })
        );
    }
}
