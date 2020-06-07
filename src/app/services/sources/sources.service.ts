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

    async init(): Promise<void> {
        // Clear or refresh on login change
        this._auth.loggedIn.pipe(
            tap(l => !!l
                ? this.refresh()
                : this.clear()
            )
        ).subscribe();

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
