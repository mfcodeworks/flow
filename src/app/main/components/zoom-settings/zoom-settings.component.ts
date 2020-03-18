import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ZoomService } from '../../../services/zoom/zoom.service';

@Component({
    selector: 'app-zoom-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './zoom-settings.component.html',
    styleUrls: ['./zoom-settings.component.scss']
})
export class ZoomSettingsComponent {
    isElectron = !!window.require;
    zoomLevel = localStorage.getItem('app-zoom') || '100'

    constructor(private zoom: ZoomService) {}

    onZoomChange(event: MatButtonToggleChange) {
        this.zoom.setZoom(parseInt(event.value));
    }
}
