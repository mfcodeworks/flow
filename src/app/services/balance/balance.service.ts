import { Injectable } from '@angular/core';
import { BackendService } from '../backend/backend.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { mergeMap, tap, switchMap, filter } from 'rxjs/operators';
import { Balance } from '../../main/core/balance';

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

    init(): void {
        // clear on logout
        this._auth.loggedIn.pipe(
            filter(l => !l)
        ).subscribe(() => this.clear());

        // Refetch on new login
        this._auth.loggedIn.pipe(
            filter(l => !!l)
        ).subscribe(() => this.refresh());

        // Fetch balance
        this.trigger$.pipe(
            // Confirm use is authorised first
            switchMap(() => this._auth.isLoggedIn()),
            filter(l => !!l),
            // Get balance from API
            mergeMap(() => this._backend.getUserBalance()),
            // DEBUG: Log balance
            tap(b => console.warn(`${this.constructor.name} retrieved Balance:`, b))
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
