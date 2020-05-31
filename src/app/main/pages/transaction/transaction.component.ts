import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent implements OnInit {
    // TODO: Get transaction from backend
    id: Observable<string> = this.route.paramMap.pipe(map(m => m.get('id')));

    constructor(
        private route: ActivatedRoute
    ) { }

    ngOnInit() {}

}
