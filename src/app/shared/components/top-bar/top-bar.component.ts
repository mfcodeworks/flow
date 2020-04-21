import { Component, ViewChild, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements AfterViewInit {
    @ViewChild('topbar') topbar: any;
    public el: any;
    isDark: boolean;

    ngAfterViewInit(): void {
        this.el = this.topbar.el;
    }
}
