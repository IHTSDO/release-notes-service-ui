import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'reverseAlphabetical'
})
export class ReverseAlphabeticalPipe implements PipeTransform {

    transform(items: any[], key): any {
        if (!items) {
            return [];
        }

        items = items.sort(function (a, b) {
            if (a[key] > b[key]) {
                return -1;
            }

            if (a[key] < b[key]) {
                return 1;
            }
        });

        return items;
    }
}
