import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'dateFilter',
    pure: true
})
export class DateFilterPipe implements PipeTransform {
    transform(value: any[], ...args: any[]): any {
        if (args.length == 3) {
            return value.filter(d => moment(d[args[2]]).isSame(args[1], args[0]));
        }
        return value.filter(d => moment(d).isSame(args[1], args[0]));
    }
}
