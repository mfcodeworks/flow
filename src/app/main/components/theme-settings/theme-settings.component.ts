import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
    selector: 'app-theme-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './theme-settings.component.html',
    styleUrls: ['./theme-settings.component.scss']
})
export class ThemeSettingsComponent implements OnInit {

    constructor(public _theme: ThemeService) { }

    ngOnInit() {
        console.log('Available themes:', this._theme.availableThemes());
        console.log('Current theme:', this._theme.currentTheme());
    }

    onToggleDarkMode(event: MatSlideToggleChange): void {
        this._theme.toggleDarkMode(event.checked)
    }
}
