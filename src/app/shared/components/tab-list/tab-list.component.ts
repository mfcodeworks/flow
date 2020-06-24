import { Component, ChangeDetectionStrategy, QueryList, AfterViewInit, ContentChildren, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabContentComponent } from './tab-content/tab-content.component';

@Component({
    selector: 'app-tab-list',
    templateUrl: './tab-list.component.html',
    styleUrls: ['./tab-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabListComponent implements AfterViewInit {
    @ContentChildren(TabContentComponent)
    content: QueryList<TabContentComponent>;
    active$ = new BehaviorSubject<string>('');

    constructor(private cd: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        console.warn('TAB VIEW INIT', this.content);

        // Set tab active$
        this.tab({detail: {value: this.content.first.label}});
    }

    tab({detail: {value: label}}) {
        console.warn('Setting label', label);

        // Set active$ item
        this.active$.next(label);

        // Change displayed content
        this.content.forEach((el: TabContentComponent) => {
            console.warn('Tab content', el, el.label === label);
            el.label === label
                ? el.show()
                : el.hide();
        });

        // Update component
        this.cd.detectChanges();
    }
}
