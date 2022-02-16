import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ReleaseNotesService {

    private releaseNotes = new Subject<any>();
    private subjects = new Subject<any>();
    private activeReleaseNote = new Subject<any>();
    private editedContent = new BehaviorSubject<any>(false);

    constructor(private http: HttpClient) {
    }

    // Setters & Getters: ReleaseNotes
    setReleaseNotes(releaseNotes) {
        this.releaseNotes.next(releaseNotes);
    }

    getReleaseNotes() {
        return this.releaseNotes.asObservable();
    }

    // Setters & Getters: Subjects
    setSubjects(subjects) {
        this.subjects.next(subjects);
    }

    getSubjects() {
        return this.subjects.asObservable();
    }

    // Setters & Getters: ActiveReleaseNote
    setActiveReleaseNote(releaseNote) {
        this.activeReleaseNote.next(releaseNote);
    }

    getActiveReleaseNote() {
        return this.activeReleaseNote.asObservable();
    }

    // Setters & Getters: EditedContent
    setEditedContent(editedContent) {
        this.editedContent.next(editedContent);
    }

    getEditedContent() {
        return this.editedContent.asObservable();
    }

    httpGetSubjects() {
        return this.http.get('/release-notes/MAIN/subjects');
    }

    httpGetReleaseNotes() {
        return this.http.get('/release-notes/MAIN/lineitems');
    }

    httpPutReleaseNote(lineitem) {
        return this.http.put('/release-notes/MAIN/lineitems/' + lineitem.id, lineitem);
    }
}
