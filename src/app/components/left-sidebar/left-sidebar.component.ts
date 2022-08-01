import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {ModalService} from '../../services/modal/modal.service';
import {ToastrService} from 'ngx-toastr';
import {Note} from '../../models/note';
import {AuthenticationService} from '../../services/authentication/authentication.service';

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
    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;
    editedContent: any;
    editedContentSubscription: Subscription;
    editMode: any;
    editModeSubscription: Subscription;
    roles: any;
    rolesSubscription: Subscription;
    content: any;
    contentSubscription: Subscription;

    lineItemTempStorage: any;

    constructor(private releaseNotesService: ReleaseNotesService,
                private modalService: ModalService,
                private toastr: ToastrService,
                private authenticationService: AuthenticationService) {
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => {this.activeReleaseNote = data; this.lineItemTempStorage = undefined; });
        this.editedContentSubscription = this.releaseNotesService.getEditedContent().subscribe(data => this.editedContent = data);
        this.editModeSubscription = this.releaseNotesService.getEditMode().subscribe(data => this.editMode = data);
        this.rolesSubscription = this.authenticationService.getRoles().subscribe(data => this.roles = data);
        this.contentSubscription = this.releaseNotesService.getContent().subscribe(data => this.content = data);
    }

    ngOnInit() {
        this.releaseNotesService.httpGetReleaseNotes().subscribe(lineitems => {
            this.releaseNotesService.setReleaseNotes(lineitems);
        });
    }

    openModal(id: string): void {
        this.modalService.open(id);
    }

    closeModal(id: string): void {
        this.modalService.close(id);
    }

    save(): void {
        this.activeReleaseNote.content = this.content;
        this.releaseNotesService.httpPutReleaseNote(this.activeReleaseNote).subscribe(data => {
            this.releaseNotesService.setEditedContent(false);
            if (this.lineItemTempStorage) {
                this.releaseNotesService.setEditMode(false);
                this.releaseNotesService.setActiveReleaseNote(this.lineItemTempStorage);
            }
            this.releaseNotesService.httpGetReleaseNotes().subscribe(releaseNotes => {
                this.releaseNotesService.setReleaseNotes(releaseNotes);
            });
            this.toastr.success('Release Note: ' + data['title'], 'SAVED', this.toastrConfig);
        });
    }

    discard(): void {
        this.releaseNotesService.setEditedContent(false);
        this.releaseNotesService.httpGetReleaseNotes().subscribe(data => {
            this.releaseNotesService.setReleaseNotes(data);
            if (this.lineItemTempStorage) {
                this.releaseNotesService.setActiveReleaseNote(this.lineItemTempStorage);
            }
            this.releaseNotesService.setEditMode(false);
        });
    }

    create(text, parentId): void {
        const newNote = new Note(text);

        if (parentId) {
            newNote.parentId = parentId;
        }

        this.releaseNotesService.httpPostReleaseNote(newNote).subscribe(
            success => {
                this.toastr.success(success['title'], 'CREATED', this.toastrConfig);
                this.refresh();
            },
            error => {
                this.toastr.error('You do not have authorization to do this action', 'ERROR', this.toastrConfig);
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

    roleContains(role): boolean {
        if (this.roles) {
            return !!this.roles.includes(role);
        }
    }

    downloadPDF(): void {
        this.releaseNotesService.httpDownloadPDF().subscribe();
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
