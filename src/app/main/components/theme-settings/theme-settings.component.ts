import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-theme-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './theme-settings.component.html',
    styleUrls: ['./theme-settings.component.scss']
})
export class ThemeSettingsComponent implements OnInit {
    isDark$: Observable<boolean>;
    availableThemes$ = of(this._theme.availableThemes());
    currentTheme$ = of(this._theme.currentTheme());

    constructor(public _theme: ThemeService) {}

    ngOnInit() {
        this.isDark$ = this._theme.isDarkMode();

        console.log('Available themes:', this._theme.availableThemes());
        console.log('Current theme:', this._theme.currentTheme());
    }

    onToggleDarkMode({detail}): void {
        this._theme.toggleDarkMode(detail.checked);
    }

    onToggleTheme({detail}): void {
        this._theme.setColourTheme(detail.value);
    }
}
