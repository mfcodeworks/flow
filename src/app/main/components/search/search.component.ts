import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, tap, catchError, switchMap } from 'rxjs/operators';
import { CacheService } from 'src/app/services/cache/cache.service';
import { Profile } from '../../core/profile';
import { BackendService } from 'src/app/services/backend/backend.service';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-search',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit {
    @ViewChild('search') searchInput: ElementRef;
    profiles: Observable<Profile[]>;
    loading: boolean = false;

    constructor(
        private backend: BackendService,
        private cache: CacheService
    ) { }

    ngAfterViewInit() {
        // On user input, pipe search results
        this.profiles = fromEvent<Profile[]>(this.searchInput.nativeElement, 'keyup').pipe(
            // Get input
            map((event: any) => event.target.value),

            // Filter input, at least 2 characters
            filter((res: string) => res.length > 1),

            // Wait 1 second after user finished
            debounceTime(800),

            // Don't requery unless input changes
            distinctUntilChanged(),

            // Set query as loading
            tap(_ => this.loading = true),

            // Get profile results
            switchMap((search: string) => this.backend.search(search).pipe(
                tap(r => this.cache.store(`search-${search}`, r))
            )),

            // Log result
            tap(r => console.log('Results:', r)),

            // Set loading complete
            tap(_ => this.loading = false),

            // Catch errors
            catchError(err => {
                console.warn(err);
                this.loading = false;
                return [];
            })
        )
    }
}
