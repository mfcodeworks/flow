import { Injectable } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Observable, of, iif } from 'rxjs';
import { mergeMap, tap, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SignedInGuard implements CanActivate, CanActivateChild {
    constructor(
        private auth: AuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        // Check user is logged in
        return this.auth.isLoggedIn().pipe(
            tap(u => console.log('SignedIn Guard - Retrieved auth from service', u)),
            // Return true, or redirect to login/authorize
            mergeMap(u => !!u
                ? of(true)
                : this.auth.hasSession().pipe(
                    tap(e => console.log('SignedIn Guard - User exists in cache', e)),
                    tap(e => !!e
                        ? this.router.navigate(['/authorize'], {
                            queryParams: { redirect: state.url }
                        })
                        : this.router.navigate(['/login'])
                    ),
                    map(() => false)
                )
            )
        );
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
