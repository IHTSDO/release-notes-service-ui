import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ModalService} from '../../services/modal/modal.service';
import {ToastrService} from 'ngx-toastr';
import {MarkdownService} from "ngx-markdown";
import Quill from 'quill';
import TurndownService from 'turndown';
import {JiraService} from "../../services/jira/jira.service";

@Component({
    selector: 'app-main-view',
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

    toastrConfig = {
        closeButton: true
    };

    activeVersion: any;
    activeVersionSubscription: Subscription;
    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;
    releaseNotes: any[];
    releaseNotesSubscription: Subscription;
    user: any;
    userSubscription: Subscription;
    roles: any;
    rolesSubscription: Subscription;
    editedContent: any;
    editedContentSubscription: Subscription;
    editMode: any;
    editModeSubscription: Subscription;

    quill: any;
    turndown: any;
    toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']];


    constructor(private releaseNotesService: ReleaseNotesService,
                private authenticationService: AuthenticationService,
                private modalService: ModalService,
                private jiraService: JiraService,
                private toastr: ToastrService,
                private markdownService: MarkdownService) {
        this.activeVersionSubscription = this.releaseNotesService.getActiveVersion().subscribe(data => {
            this.activeVersion = data;
            this.releaseNotesService.httpGetReleaseNotes().subscribe(notes => {
                this.releaseNotesService.setReleaseNotes(notes);
                this.releaseNotesService.setActiveReleaseNote(null);
            });
        });
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.editedContentSubscription = this.releaseNotesService.getEditedContent().subscribe(data => this.editedContent = data);
        this.editModeSubscription = this.releaseNotesService.getEditMode().subscribe(data => this.editMode = data);
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
        this.rolesSubscription = this.authenticationService.getRoles().subscribe(data => this.roles = data);
    }

    ngOnInit(): void {
    }

    openModal(id: string): void {
        this.modalService.open(id);
    }

    closeModal(id: string): void {
        this.modalService.close(id);
    }

    save(): void {
        let content = this.quill.root.innerHTML;
        // this.activeReleaseNote.content = this.markdownService.parse(content);

        const turndownService = new TurndownService();

        this.activeReleaseNote.content = turndownService.turndown(content);

        this.releaseNotesService.httpPutReleaseNote(this.activeReleaseNote).subscribe(data => {
            this.releaseNotesService.setEditedContent(false);
            this.toastr.success('Release Note: ' + data['title'], 'SAVED', this.toastrConfig);
        });
    }

    editToggle(): void {
        if (this.editMode) {
            if (this.editedContent) {
                this.openModal('changes-modal');
            } else {
                this.editMode = false;
            }
        } else {
            this.editMode = true;

            setTimeout(() => {
                this.quillInit();
            }, 100);
        }
    }

    quillInit(): void {
        this.quill = new Quill('#quill-editor', { modules: { toolbar: this.toolbarOptions }, theme: 'snow'});

        let html = this.markdownService.parse(this.activeReleaseNote.content);
        // let content = html?.endsWith('\n<p><br></p>') ? html + '\n<p><br></p>' : html;
        // this.quill.clipboard.dangerouslyPasteHTML(content);
        this.quill.clipboard.dangerouslyPasteHTML(html);
        this.quill.on('text-change', () => {
            this.releaseNotesService.setEditedContent(true);
            this.releaseNotesService.setContent(this.quill.root.innerHTML);
        });
    }

    roleContains(role): boolean {
        if (this.roles) {
            return !!this.roles.includes(role);
        } else {
            return null;
        }
    }

    public openPDF(): void {
    }

    getVersionDate(activeVersion: string): string {
        let date = '';

        if (activeVersion) {
            date = activeVersion.split('/')[1];
        }

        return date;
    }

    getMappedName(): string {
        return 'SNOMED CT International edition';
    }

    versionReleaseNotes(effectiveTime: string): void {
        this.releaseNotesService.httpVersionReleaseNotes({effectiveTime: effectiveTime}).subscribe(data => {
            this.releaseNotesService.httpGetVersions().subscribe(versions => {
                this.releaseNotesService.setVersions(versions);
            });
            this.toastr.success('Release notes successfully versioned', 'SUCCESS');
        }, error => {
            this.toastr.error('Release notes failed to version', 'FAILURE');
        });
    }
}
