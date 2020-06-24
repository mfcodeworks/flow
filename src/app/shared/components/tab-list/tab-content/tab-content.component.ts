import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-tab-content',
    templateUrl: './tab-content.component.html',
    styleUrls: ['./tab-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabContentComponent {
    @Input('label')
    public label: string;
    public display = new BehaviorSubject<boolean>(false);

    constructor(private cd: ChangeDetectorRef) {}

    show(): void {
        this.display.next(true);
        this.cd.detectChanges();
    }

    hide(): void {
        this.display.next(false);
        this.cd.detectChanges();
    }
}
