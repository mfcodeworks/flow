import { Pipe, PipeTransform } from '@angular/core';
import { MoneyService } from '../../services/money/money.service';

@Pipe({
    name: 'money'
})
export class MoneyPipe implements PipeTransform {

    constructor(private money: MoneyService) {}

    transform(value: number, currency: string): any {
        return this.money.format(value, currency);
    }

}
