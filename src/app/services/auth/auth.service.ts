import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, iif } from 'rxjs';
import { map, filter, tap, mergeMap, switchMap, take } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { CacheService } from '../cache/cache.service';
import { Profile } from 'src/app/shared/core/profile';
import { BackendService } from '../backend/backend.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false)

    constructor(
        private user: UserService,
        private router: Router,
        private cache: CacheService,
        private backend: BackendService
    ) {}

    async init(): Promise<boolean> {
        // On logged in status change update user
        this.loggedIn.pipe(
            // Only proceed on logged in true
            filter(l => !!l),
            // Update user profile
            switchMap(() => this.updateProfile())
        ).subscribe();

        console.log('Attempting to load user');

        // On initial load attempt loading user
        return this.user.loadCache().pipe(
            tap(u => this.loggedIn.next(!!u)),
            take(1)
        ).toPromise();
    }

    public isLoggedIn(): Observable<boolean> {
        return of(!!this.user.token);
    }

    public hasSession(): Observable<boolean> {
        return this.cache.get('login').pipe(
            tap(u => console.log('User has session', u)),
            map(u => !!u)
        );
    }

    public doSignIn(response: any, passphrase?: string): void {
        this.user.build(response, passphrase);
        this.loggedIn.next(true);
    }

    public authorize(passphrase: string): Observable<boolean> {
        console.log('Decode user with passphrase', passphrase);

        return this.cache.get('login', passphrase).pipe(
            tap(user => console.log('Attempting to save user:', user)),
            mergeMap(user =>
                iif(
                    () => !!user?.token,
                    of(true).pipe(
                        tap(_ => console.log('User exists, updating service')),
                        tap(_ => Object.assign(this.user, user)),
                        tap(_ => console.log('Service updated, fetching from backend')),
                        mergeMap(() => this.updateProfile()),
                        tap(_ => console.log('Service updated', this.user)),
                        tap(_ => this.loggedIn.next(true)),
                        map(() => true)
                    ),
                    of(false)
                )
            )
        );
    }

    public updateProfile(): Observable<Profile> {
        console.log('Updating profile');

        return this.backend.getUser().pipe(
            map(profile => Object.assign(this.user.profile, profile)),
            tap(u => this.user.profile$.next(u))
        );
    }

    public doSignOut(): void {
        this.cache.clear();
        this.loggedIn.next(false);
        this.user.destroy();
        this.router.navigateByUrl('/login');
    }

    public getToken(): string {
        return this.user.token || null;
    }
}
