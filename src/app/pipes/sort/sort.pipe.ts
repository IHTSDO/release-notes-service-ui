import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

  transform(array: any[], field: string, direction: string = 'asc'): any[] {
    if (!Array.isArray(array)) {
      return [];
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return direction && direction === 'asc' ? -1 : 1;
      } else if (a[field] > b[field]) {
        return  direction && direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }

}
