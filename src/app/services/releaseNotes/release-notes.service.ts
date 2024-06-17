import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
declare var require: any
const FileSaver = require('file-saver');

@Injectable({
    providedIn: 'root'
})
export class ReleaseNotesService {

    private releaseNotes = new Subject<any>();
    private activeReleaseNote = new Subject<any>();
    private editedContent = new BehaviorSubject<any>(false);
    private content = new Subject<any>();
    private editMode = new BehaviorSubject<any>(false);
    private activeVersion = new BehaviorSubject<any>('MAIN');
    private versions = new Subject<any>();

    private _activeVersion: any;
    private _activeVersionSubscription: Subscription;

    constructor(private http: HttpClient) {
        this._activeVersionSubscription = this.getActiveVersion().subscribe(data => this._activeVersion = data);
    }

    // Setters & Getters: ReleaseNotes
    setReleaseNotes(releaseNotes) {
        this.releaseNotes.next(releaseNotes);
    }

    getReleaseNotes() {
        return this.releaseNotes.asObservable();
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

    // Setters & Getters: Content
    setContent(content) {
        this.content.next(content);
    }

    getContent() {
        return this.content.asObservable();
    }

    // Setters & Getters: EditMode
    setEditMode(editMode) {
        this.editMode.next(editMode);
    }

    getEditMode() {
        return this.editMode.asObservable();
    }

    // Setters & Getters: Versions
    setVersions(versions) {
        this.versions.next(versions);
    }

    getVersions() {
        return this.versions.asObservable();
    }

    // Setters & Getters: Active Versions
    setActiveVersion(version) {
        this.activeVersion.next(version);
    }

    getActiveVersion() {
        return this.activeVersion.asObservable();
    }

    httpGetVersions() {
        return this.http.get('/release-notes/' + this._activeVersion + '/lineitems/versions');
    }

    httpPostReleaseNote(lineitem) {
        return this.http.post('/release-notes/' + this._activeVersion + '/lineitems', lineitem);
    }

    httpGetReleaseNotes() {
        return this.http.get('/release-notes/' + this._activeVersion + '/lineitems');
    }

    httpPutReleaseNote(lineitem) {
        return this.http.put('/release-notes/' + this._activeVersion + '/lineitems/' + lineitem.id, lineitem);
    }

    httpDeleteReleaseNote(lineitem) {
        return this.http.delete('/release-notes/' + this._activeVersion + '/lineitems/' + lineitem.id);
    }

    httpVersionReleaseNotes(data) {
        return this.http.post('/release-notes/' + this._activeVersion + '/lineitems/version', data);
    }

    httpDownloadPDF() {
        FileSaver.saveAs('/release-notes/' + this._activeVersion + '/lineitems/pdf', 'Release Notes');
    }

    httpMoveReleaseNote(lineitem) {
        return this.http.put('/release-notes/' + this._activeVersion + '/lineitems/' + lineitem.id + '/update-sequence', lineitem);
    }
}
