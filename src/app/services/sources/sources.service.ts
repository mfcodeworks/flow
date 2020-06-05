import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BackendService } from '../backend/backend.service';
import { AuthService } from '../auth/auth.service';
import { switchMap, filter, mergeMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SourcesService {
    // Observable trigger
    private refreshCount = 0;
    private trigger$: BehaviorSubject<number> = new BehaviorSubject(this.refreshCount);

    // Balance Observable
    private sources$: BehaviorSubject<any[]|null> = new BehaviorSubject(null);

    constructor(
        private _backend: BackendService,
        private _auth: AuthService
    ) {}

    init(): void {
        // clear on logout
        this._auth.loggedIn.pipe(
            filter(l => !l)
        ).subscribe(() => this.clear());

        // Refetch on new login
        this._auth.loggedIn.pipe(
            filter(l => !!l)
        ).subscribe(() => this.refresh());

        // Fetch sources
        this.trigger$.pipe(
            // Confirm use is authorised first
            switchMap(() => this._auth.isLoggedIn()),
            filter(l => !!l),
            // Get sources from API
            mergeMap(() => this._backend.getUserSources())
        ).subscribe(b => this.sources$.next(b));
    }

    // Clear sources
    clear(): void {
        this.sources$.next(null);
    }

    // Refetch transactions
    refresh(): void {
        this.trigger$.next(this.refreshCount++);
    }

    // Return sources observable
    get(): BehaviorSubject<any[]|null> {
        return this.sources$;
    }
}
