import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SignedOutGuard implements CanActivate, CanActivateChild {
    constructor(
        private auth: AuthService
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.auth.isLoggedIn().pipe(
            map(t => !t)
        );
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
