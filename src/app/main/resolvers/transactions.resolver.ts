import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { BackendService } from '../../services/backend/backend.service';
import { Deprecated } from '../../shared/decorators/deprecated.decorator';
import { UserTransactions } from '../core/user-transactions';

@Deprecated
@Injectable()
export class TransactionsResolver implements Resolve<UserTransactions> {

    constructor(
        private backend: BackendService
    ) { }

    resolve(): Observable<UserTransactions> {
        return this.backend.getUserTransaction();
    }
}
