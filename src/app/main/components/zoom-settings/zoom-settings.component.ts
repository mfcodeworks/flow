import { Component, ChangeDetectionStrategy } from '@angular/core';
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

    onZoomChange({detail}) {
        this.zoom.setZoom(parseInt(detail.value));
    }
}
