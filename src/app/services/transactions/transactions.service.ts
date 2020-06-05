import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../../shared/core/transaction';
import { BackendService } from '../backend/backend.service';
import { AuthService } from '../auth/auth.service';
import { filter, tap, mergeMap, switchMap } from 'rxjs/operators';
import { UserTransactions } from '../../shared/core/user-transactions';

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
        // clear on logout
        this._auth.loggedIn.pipe(
            filter(l => !l)
        ).subscribe(() => this.clear());

        // Refetch on new login
        this._auth.loggedIn.pipe(
            filter(l => !!l)
        ).subscribe(() => this.refresh());

        // Fetch transactions
        this.trigger$.pipe(
            // Confirm use is authorised first
            switchMap(() => this._auth.isLoggedIn()),
            filter(l => !!l),
            // Get transactions from API
            mergeMap(() => this._backend.getUserTransaction())
        ).subscribe(b => this.transactions$.next(b));
    }

    // Clear transactions
    clear(): void {
        this.transactions$.next(null);
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
