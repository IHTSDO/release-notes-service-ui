import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'alphabetical'
})
export class AlphabeticalPipe implements PipeTransform {

    transform(items: any[], key?): any {
        if (!items) {
            return [];
        }

        if (key) {
            items = items.sort(function (a, b) {
                if (a[key] > b[key]) {
                    return 1;
                }

                if (a[key] < b[key]) {
                    return -1;
                }
            });
        } else {
            items = items.sort(function (a, b) {
                if (a > b) {
                    return 1;
                }

                if (a < b) {
                    return -1;
                }
            });
        }


        return items;
    }
}
