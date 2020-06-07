import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheService } from '../cache/cache.service';
import { environment } from '../../../environments/environment';
import { tap, map, filter, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    domBody: HTMLElement = document.body;
    darkMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    theme$: BehaviorSubject<string> = new BehaviorSubject('');

    constructor(private _cache: CacheService) {}

    async init(): Promise<void> {
        // Handle colour theme updates
        this.theme$.pipe(
            // Check theme exists
            filter(t => Object.keys(environment).includes(t)),
            // Add theme to body
            tap(t => this.domBody.classList.add(environment.themes[t])),
            // Remove old theme from body
            tap(t => Object.entries(environment.themes)
                .filter(([key, _]) => key != t)
                .forEach(([_, value]) => this.domBody.classList.remove(value))
            )
        ).subscribe();

        // Handle dark mode updates
        this.darkMode$.pipe(
            tap(enable => !!enable
                ? this.domBody.classList.add('dark-theme')
                : this.domBody.classList.remove('dark-theme')
            ),
            switchMap(enable => this._cache.store('dark-theme', enable))
        ).subscribe();

        // Set dark theme from cache
        let d = this._cache.get('dark-theme').pipe(
            tap(d => this.toggleDarkMode(!!d))
        ).subscribe(_ => d.unsubscribe());

        // Set colour theme from cache
        let c = this._cache.get('colour-theme').pipe(
            map(d => d ? d : this.defaultTheme()),
            map(t => this.setColourTheme(t))
        ).subscribe(_ => c.unsubscribe());
    }

    // Return is dark observable
    public isDarkMode(): Observable<boolean> {
        return this.darkMode$.asObservable();
    }

    // Set dark mode to value
    public toggleDarkMode(enable: boolean): void {
        this.darkMode$.next(enable);
    }

    // Return list of available themes
    public availableThemes(): string[] {
        return Object.keys(environment.themes)
    }

    // Return default theme
    public defaultTheme(): string {
        return Object.keys(environment.themes)
            .find(key => environment.themes[key] === '');
    }

    // Return current theme
    public currentTheme(): string {
        return !!this.theme$.value
            ? this.theme$.value
            : this.defaultTheme();
    }

    // Set theme to value
    public setColourTheme(theme: string): void {
        this.theme$.next(theme);
    }
}
