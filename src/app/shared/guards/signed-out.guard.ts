import { Injectable } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SignedOutGuard implements CanActivate, CanActivateChild {
    constructor(
        private user: UserService,
        private auth: AuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.user.profile$.pipe(
            // DEBUG:
            tap(() => console.log('Run signed out guard')),

            switchMap(u => {
                // If logged in redirect to wallet
                if (!!u) {
                    this.router.navigateByUrl('/wallet');
                    return of(false);

                // If not logged in check for session
                } else {
                    return this.auth.hasSession().pipe(
                        map(s => {
                            // If session exists
                            if (s) {
                                // Allow access or redirect to authorize
                                if (state.url.indexOf('authorize') >= 0) {
                                    return true;
                                } else {
                                    this.router.navigateByUrl('/authorize')
                                    return false;
                                }
                            }
                            // If no session continue
                            return true;
                        })
                    )
                }
            }),

            tap(a => console.log('Is signed out?', a))
        );
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
