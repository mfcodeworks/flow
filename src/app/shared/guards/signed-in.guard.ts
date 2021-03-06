import { Injectable } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Injectable({
    providedIn: 'root'
})
export class SignedInGuard implements CanActivate, CanActivateChild {
    constructor(
        private user: UserService,
        private auth: AuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        // Check user is logged in
        return this.user.profile$.pipe(
            // DEBUG:
            tap(() => console.log('Run signed in guard')),

            // Check logged in state
            switchMap(u => !!u
                // If logged in return true
                ? of(true)
                // If not logged in check if a user exists in cache
                : this.auth.hasSession().pipe(
                    // Direct to authorize or logged in based on cache
                    tap(e => !!e
                        ? this.router.navigate(['/authorize'], {
                            queryParams: { redirect: state.url }
                        })
                        : this.router.navigate(['/login'], {
                            queryParams: { redirect: state.url }
                        })
                    ),
                    map(() => false)
                )
            ),
            
            tap(a => console.log('Is signed in', a))
        );
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
