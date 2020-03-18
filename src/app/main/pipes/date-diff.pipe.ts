import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

    // Moment.js set locale to display with shorthand (s,h,d,m,y)
    constructor() {}

    // Moment.js datediff from now (e.g. 8d for a date 8 days ago)
    transform(value: any, ...args: any[]): string {
        // Check weeks as moment.js only provides months, not weeks for fromNow()
        const weeks = moment().diff(value, 'weeks');
        return weeks < 52 && weeks > 2
            ? `${weeks}w` : moment(value).fromNow();
    }

}
