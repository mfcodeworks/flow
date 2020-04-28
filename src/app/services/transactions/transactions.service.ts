import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../../main/core/transaction';
import { BackendService } from '../backend/backend.service';
import { AuthService } from '../auth/auth.service';
import { filter, tap, mergeMap, switchMap } from 'rxjs/operators';
import { UserTransactions } from '../../main/core/user-transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
    // Observable trigger
    private refreshCount = 0;
    private trigger$: BehaviorSubject<number> = new BehaviorSubject(this.refreshCount);

    // Balance Observable
    private transactions$: BehaviorSubject<UserTransactions|null> = new BehaviorSubject(null);

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
            mergeMap(() => this._backend.getUserTransaction()),
            // DEBUG: Log balance
            tap(b => console.warn(`${this.constructor.name} retrieved Transactions:`, b))
        ).subscribe(b => this.transactions$.next(b));

        // Refetch on auth change
        this._auth.loggedIn.pipe(
            filter(l => !!l)
        ).subscribe(() => this.refresh());
    }

    // Refetch transactions
    refresh(): void {
        this.trigger$.next(this.refreshCount++);
    }

    // Return transactions observable
    get(): BehaviorSubject<UserTransactions|null> {
        return this.transactions$;
    }
}
