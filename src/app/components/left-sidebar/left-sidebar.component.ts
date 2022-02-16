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

    lineItemTempStorage: any;

    constructor(private releaseNotesService: ReleaseNotesService,
                private modalService: ModalService,
                private toastr: ToastrService) {
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
        this.editedContentSubscription = this.releaseNotesService.getEditedContent().subscribe(data => this.editedContent = data);
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
        });
    }

    selectReleaseNote(lineitem) {
        if (this.editedContent) {
            this.lineItemTempStorage = lineitem;
            this.openModal('changes-modal');
        } else {
            if (this.activeReleaseNote === lineitem) {
                this.releaseNotesService.setActiveReleaseNote(undefined);
            } else {
                this.releaseNotesService.setActiveReleaseNote(lineitem);
            }
        }
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
