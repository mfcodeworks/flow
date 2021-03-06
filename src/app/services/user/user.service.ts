import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

import { Profile } from '../../shared/core/profile';
import { CacheService } from '../cache/cache.service';
import { filter, catchError, map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    public token: string;
    public profile: Profile = null;
    public profile$: BehaviorSubject<Profile> = new BehaviorSubject(null);

    constructor(private cache: CacheService) {}

    // Load user from cache
    public loadCache(): Observable<boolean> {
        console.log('Attempting to load user');

        return this.cache.get('login').pipe(
            filter(u => !(typeof u === 'string')),
            map((user: { token: string }) => Object.assign(this, user)),
            map(() => true),
            catchError(err => {
                console.warn(err);
                return of(false);
            }),
            take(1)
        );
    }

    // Build user object
    public build(model: any, passphrase?: string): void {
        console.log('Building user service', model);

        try {
            // Update user as logged in
            Object.assign(this, model);
            this.profile$.next(this.profile);

            // Cache user object
            this.cacheUser(passphrase).subscribe();
            console.log('Built user service', this.toJson());
        } catch(e) {
            throw e;
        }
    }

    // Destroy local user
    public destroy(): void {
        this.profile$.next(null);
        this.token = null;
        this.profile = null;
    }

    // Save user object
    public cacheUser(passphrase?: string): Observable<any> {
        return this.cache.store('login', this.toJson(), passphrase);
    }

    public toJson(): {token: string; profile: {id: number; stripeConnectId: string; stripeCustomerId: string}} {
        return {
            token: this.token,
            profile: {
                id: this.profile.id,
                stripeConnectId: this.profile.stripeConnectId,
                stripeCustomerId: this.profile.stripeCustomerId
            }
        };
    }
}
