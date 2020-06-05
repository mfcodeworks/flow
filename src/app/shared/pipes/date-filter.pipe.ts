import { Pipe, PipeTransform } from '@angular/core';
import isSameSecond from 'date-fns/isSameSecond';
import isSameMinute from 'date-fns/isSameMinute';
import isSameHour from 'date-fns/isSameHour';
import isSameDay from 'date-fns/isSameDay';
import isSameWeek from 'date-fns/isSameWeek';
import isSameMonth from 'date-fns/isSameMonth';
import isSameQuarter from 'date-fns/isSameQuarter';
import isSameYear from 'date-fns/isSameYear';

type comparison ='second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year';

@Pipe({
    name: 'dateFilter',
    pure: true
})
export class DateFilterPipe implements PipeTransform {
    transform(value: any[], comparisonType: comparison, comparisonDate: Date, comparisonField?: string): any[] {
        switch (comparisonType.toLowerCase()) {
            case 'second':
                return value.filter(d => isSameSecond(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'minutes':
                return value.filter(d => isSameMinute(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'hour':
                return value.filter(d => isSameHour(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'day':
                return value.filter(d => isSameDay(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'week':
                return value.filter(d => isSameWeek(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'month':
                return value.filter(d => isSameMonth(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'quarter':
                return value.filter(d => isSameQuarter(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
            case 'year':
                return value.filter(d => isSameYear(new Date(comparisonField ? d[comparisonField] : d), comparisonDate));
        }
    }
}
