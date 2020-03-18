import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, iif } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

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
            tap(u => console.log('Retrieved user from service', u)),
            mergeMap(u =>
                // Switch user logged in answer
                iif(
                    () => u,

                    // True returns true
                    of(true),

                    // False checks if an object exists in cache
                    of(false).pipe(
                        tap(() =>
                            this.auth.hasSession().pipe(
                                tap(e => console.log('User exists in cache', e))
                            ).subscribe(e =>
                                e ? this.router.navigate(['/authorize'], {
                                    queryParams: { redirect: state.url }
                                }) : this.router.navigate(['/login'])
                            )
                        )
                    )
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
