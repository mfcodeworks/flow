import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, mergeMap, filter } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
    // Get zoom level (localStorage required for electron index.js)
    zoom$ = new BehaviorSubject(100);
    doZoom$: Observable<number>;

    constructor(private _cache: CacheService) {}

    init(): void {
        console.log('Init Zoom Service');

        // Set doZoom recipe
        this.doZoom$ = this.zoom$.pipe(
            filter(z => z>0),
            map(z => z/100),
            tap(z => console.log('Setting zoom to', z)),
            tap(z => !!window.require ? window.require('electron').webFrame.setZoomFactor(z) : void(0)),
            mergeMap(z => this._cache.store('app-zoom', z*100))
        );

        // Initialise zoom
        this._cache.get('app-zoom').pipe(
            map((z: number) => this.zoom$.next(z))
        ).subscribe(() => this.doZoom$.subscribe())
    }

    setZoom(zoom: number) {
        console.log('Zoom changed to:', zoom);
        this.zoom$.next(zoom);
    }
}
