import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheService } from '../cache/cache.service';
import { environment } from '../../../environments/environment';
import { tap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    domBody: HTMLElement = document.body;
    darkMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(private _cache: CacheService) {}

    init(): void {
        // Set dark theme from cache
        this._cache.get('dark-theme').pipe(
            tap(d => this.toggleDarkMode(!!d))
        ).subscribe(d => this.darkMode.next(!!d));

        // Set colour theme from cache
        this._cache.get('colour-theme').pipe(
            map(d => d ? d : this.defaultTheme())
        ).subscribe(t => this.setColourTheme(t));
    }

    // Return is dark observable
    public isDarkMode(): Observable<boolean> {
        return this.darkMode.asObservable();
    }

    // Set dark mode to value
    public toggleDarkMode(enable: boolean): void {
        !!enable
            ? this.domBody.classList.add('dark-theme')
            : this.domBody.classList.remove('dark-theme');

        this.darkMode.next(!!enable)
        this._cache.store('dark-theme', enable);
    }

    // Return list of available themes
    public availableThemes(): string[] {
        return Object.keys(environment.themes)
    }

    // Return default theme
    public defaultTheme(): string {
        return Object.keys(environment.themes).find(key => environment.themes[key] == '');
    }

    // Return current theme
    public currentTheme(): string {
        const current = Object.keys(environment).find(t => this.domBody.classList.contains(t));
        if (current) {
            return current;
        }
        return this.defaultTheme();
    }

    // Set theme to value
    public setColourTheme(theme: string): void {
        // Check theme exists
        if (!Object.keys(environment).includes(theme)) {
            return
        }

        // Add new theme to body
        this.domBody.classList.add(environment.themes[theme])

        // Remove old theme
        Object.entries(environment.themes)
        .filter(([key, value]) => key != theme)
        .forEach(([key, value]) => this.domBody.classList.remove(value as string));
    }
}
