import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {

    transform(value: any[], key: string): any {
        return value.map(v => v[key]);
    }

}
