import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'reverseAlphabetical'
})
export class ReverseAlphabeticalPipe implements PipeTransform {

    transform(items: any[]): any {
        if (!items) {
            return [];
        }

        items = items.sort(function (a, b) {
            if (a < b) {
                return 1;
            }

            if (a > b) {
                return -1;
            }
        });

        return items;
    }
}
