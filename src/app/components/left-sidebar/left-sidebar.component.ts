import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {ModalService} from '../../services/modal/modal.service';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-left-sidebar',
    templateUrl: './left-sidebar.component.html',
    styleUrls: ['./left-sidebar.component.scss']
})
export class LeftSidebarComponent implements OnInit {

    textFilter: string;
    toastrConfig = {
        closeButton: true
    };

    releaseNotes: any[];
    releaseNotesSubscription: Subscription;
    subjects: any[];
    subjectsSubscription: Subscription;
    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;
    editedContent: any;
    editedContentSubscription: Subscription;
    editMode: any;
    editModeSubscription: Subscription;

    lineItemTempStorage: any;
    newNote = {parentId: '', level: '', subjectId: ''};

    constructor(private releaseNotesService: ReleaseNotesService,
                private modalService: ModalService,
                private toastr: ToastrService) {
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
        this.editedContentSubscription = this.releaseNotesService.getEditedContent().subscribe(data => this.editedContent = data);
        this.editModeSubscription = this.releaseNotesService.getEditMode().subscribe(data => this.editMode = data);
        this.subjectsSubscription = this.releaseNotesService.getSubjects().subscribe( data => this.subjects = data);
    }

    ngOnInit() {
        this.releaseNotesService.httpGetSubjects().subscribe(subjects => {
            this.releaseNotesService.setSubjects(subjects);

            this.releaseNotesService.httpGetReleaseNotes().subscribe(lineitems => {
                this.releaseNotesService.setReleaseNotes(lineitems);
            });
        });
    }

    openModal(id: string): void {
        this.modalService.open(id);
    }

    closeModal(id: string): void {
        this.modalService.close(id);
    }

    save(): void {
        this.releaseNotesService.httpPutReleaseNote(this.activeReleaseNote).subscribe(data => {
            this.releaseNotesService.setEditedContent(false);
            this.releaseNotesService.setActiveReleaseNote(this.lineItemTempStorage);
            this.toastr.success('Release Note: ' + data['title'], 'SAVED', this.toastrConfig);
        });
    }

    discard(): void {
        this.releaseNotesService.setEditedContent(false);
        this.releaseNotesService.httpGetReleaseNotes().subscribe(data => {
            this.releaseNotesService.setReleaseNotes(data);
            this.releaseNotesService.setActiveReleaseNote(this.lineItemTempStorage);
            this.releaseNotesService.setEditMode(false);
        });
    }

    create(text): void {
        this.releaseNotesService.httpPostSubject({title: text}).subscribe(subjectData => {

            this.newNote.subjectId = subjectData['id'];

            if (this.newNote.parentId) {
                this.newNote.level = '2';
            } else {
                delete this.newNote.parentId;
                this.newNote.level = '1';
            }

            this.releaseNotesService.httpPostReleaseNote(this.newNote).subscribe(
                success => {
                    this.toastr.success(success['title'], 'CREATED', this.toastrConfig);
                    this.refresh();
                    this.newNote = {parentId: '', level: '', subjectId: ''};
                },
                error => {
                    this.toastr.error('You do not have authorization to do this action', 'ERROR', this.toastrConfig);
                });
        });
    }

    delete(override?: boolean): void {
        if (this.lineItemTempStorage.level === 1 && !override) {
            this.modalService.open('delete-confirmation-modal');
        } else {
            this.releaseNotesService.httpDeleteReleaseNote(this.lineItemTempStorage).subscribe(data => {
                this.toastr.error(this.lineItemTempStorage.title, 'DELETED', this.toastrConfig);
                this.refresh();
                this.lineItemTempStorage = undefined;
            });
        }
    }

    refresh(): void {
        this.releaseNotesService.httpGetReleaseNotes().subscribe(data => {
            this.releaseNotesService.setReleaseNotes(data);
        });
    }

    selectReleaseNote(lineitem) {
        if (this.editedContent) {
            this.lineItemTempStorage = lineitem;
            this.openModal('changes-modal');
        } else {
            this.releaseNotesService.setEditMode(false);
            if (this.activeReleaseNote === lineitem) {
                this.releaseNotesService.setActiveReleaseNote(undefined);
            } else {
                this.releaseNotesService.setActiveReleaseNote(lineitem);
            }
        }
    }

    downloadPDF(): void {

    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
