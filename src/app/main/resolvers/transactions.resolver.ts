import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { BackendService } from '../../services/backend/backend.service';

import { Transaction } from '../../main/core/transaction';

@Injectable()
export class TransactionsResolver implements Resolve<Transaction[]> {

    constructor(
        private backend: BackendService
    ) { }

    resolve(): Observable<Transaction[]> {
        return this.backend.getUserTransaction();
    }
}
