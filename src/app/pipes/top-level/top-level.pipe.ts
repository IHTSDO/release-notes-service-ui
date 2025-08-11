import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'topLevel' })
export class TopLevelPipe implements PipeTransform {

    transform(items: any[]): any {
        if (!items) {
            return [];
        }

        items = items.filter(item => item.children.length);

        return items;
    }

}
