import { Pipe, PipeTransform } from '@angular/core';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';

@Pipe({
    name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

    transform(value: string, comparison?: Date): string {
        const date = new Date(value);
        return !!comparison
            ? formatDistanceStrict(date, comparison).slice(0, 3).replace(' ', '')
            : formatDistanceToNowStrict(date).slice(0, 3).replace(' ', '');
    }

}
