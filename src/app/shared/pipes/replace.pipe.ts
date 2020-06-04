import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, find:string, replace: string): any {
    return value.replace(find, replace);
  }

}
