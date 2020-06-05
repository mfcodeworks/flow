import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, mergeMap, filter, switchMap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
    // FIXME: Fix for no nodeIntegration
    // Get zoom level (localStorage required for electron index.js)
    zoom$ = new BehaviorSubject(100);
    
    constructor(private _cache: CacheService) {}

    init(): void {
        console.log('Init Zoom Service');

        // Set doZoom recipe
        this.zoom$.pipe(
            filter(z => z>0),
            tap(z => console.log('Setting zoom to', z)),
            tap(z => document.body.style.zoom = `${z}%`),
            mergeMap(z => this._cache.store('app-zoom', z))
        ).subscribe();

        // Initialise zoom
        this._cache.get('app-zoom').pipe(
            map((z: number) => this.zoom$.next(z))
        ).subscribe();
    }

    setZoom(zoom: number) {
        console.log('Zoom changed to:', zoom);
        this.zoom$.next(zoom);
    }
}
