import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, distinctUntilChanged, tap, catchError, switchMap } from 'rxjs/operators';
import { CacheService } from 'src/app/services/cache/cache.service';
import { Profile } from '../../../shared/core/profile';
import { BackendService } from 'src/app/services/backend/backend.service';

@Component({
    selector: 'app-search',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit {
    @ViewChild('search') searchInput: ElementRef;
    input$ = new BehaviorSubject('');
    profiles$: Observable<Profile[]>;
    loading$ = new BehaviorSubject<boolean>(false);

    constructor(
        private backend: BackendService,
        private cache: CacheService
    ) { }

    ngAfterViewInit() {
        // On user input, pipe search results
        this.profiles$ = this.input$.pipe(
            // Filter input, at least 2 characters
            filter((res: string) => res.length > 1),

            // Don't requery unless input changes
            distinctUntilChanged(),

            // Set query as loading$
            tap(_ => this.loading$.next(true)),

            // Get profile results
            switchMap((search: string) => this.backend.search(search).pipe(
                tap(r => this.cache.store(`search-${search}`, r))
            )),

            // Set loading$ complete
            tap(_ => this.loading$.next(false)),

            // Catch errors
            catchError(err => {
                console.warn(err);
                this.loading$.next(false);
                return [];
            })
        )
    }

    onInput({detail: {value}}) {
        this.input$.next(value);
    }
}
