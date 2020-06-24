import { Injectable } from '@angular/core';
import { BackendService } from '../backend/backend.service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { tap, switchMap, filter } from 'rxjs/operators';
import { Balance } from '../../shared/core/balance';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
    // Observable trigger
    private refreshCount = 0;
    private trigger$: BehaviorSubject<number> = new BehaviorSubject(this.refreshCount);

    // Balance Observable
    private balance$: BehaviorSubject<Balance|null> = new BehaviorSubject(null);

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

        // Fetch balance
        this.trigger$.pipe(
            // Confirm use is authorised first
            switchMap(() => this._auth.isLoggedIn()),
            filter(l => !!l),
            // Get balance from API
            switchMap(() => this._backend.getUserBalance())
        ).subscribe(b => this.balance$.next(b));
    }

    // Clear balance
    clear(): void {
        this.balance$.next(null);
    }

    // Refetch balance
    refresh(): void {
        this.trigger$.next(this.refreshCount++);
    }

    // Return balance observable
    get(): BehaviorSubject<Balance|null> {
        return this.balance$;
    }
}
