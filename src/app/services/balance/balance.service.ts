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
    private balance$: BehaviorSubject<Balance | null> = new BehaviorSubject(null);

    constructor(
        private _backend: BackendService,
        private _auth: AuthService
    ) {}

    init(): void {
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

        // Refetch on auth change
        this._auth.loggedIn.pipe(
            filter(l => !!l)
        ).subscribe(() => this.refresh());
    }

    refresh() {
        // Refetch balance
        this.trigger$.next(this.refreshCount++);
    }

    get(): Subject<Balance> {
        // Return balance observable
        return this.balance$;
    }
}
