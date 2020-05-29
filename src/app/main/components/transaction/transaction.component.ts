import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent implements OnInit {
    id: Observable<string> = this.route.paramMap.pipe(
        pluck('id')
    );

    constructor(
        private route: ActivatedRoute
    ) { }

    ngOnInit() {}

}
