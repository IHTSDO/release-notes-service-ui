import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'noteWithContentFilter' })
export class NoteWithContentFilterPipe implements PipeTransform {

  transform(value: any[]): any[] {
    if (value) {
      return this.filterReleaseNotesWithContent(JSON.parse(JSON.stringify(value)));
    }
    return [];
  }

  filterReleaseNotesWithContent(notes: any[]): any[] {
    for (let note of notes) {
        if(note.children) {
            note.children = this.filterReleaseNotesWithContent(note.children);
        }
    }
    return notes.filter(note => note.content || note.children.length > 0);
  }

}
