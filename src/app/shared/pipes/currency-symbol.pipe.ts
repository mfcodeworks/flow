import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencySymbol',
    pure: true
})
export class CurrencySymbolPipe implements PipeTransform {

    transform(currency: string, ...args: any[]): any {
        if (!currency) {
            return '';
        }
        return (0).toLocaleString(
            navigator.language, {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).replace(/\d/g, '').trim();
    }

}
