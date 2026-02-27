import {Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ModalService} from '../../services/modal/modal.service';
import {ToastrService} from 'ngx-toastr';
import { MarkdownComponent } from "ngx-markdown";
import Quill from 'quill';
import TurndownService from 'turndown';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { NoteWithContentFilterPipe } from '../../pipes/note-filter/note-with-content-filter.pipe';
import MarkdownIt from 'markdown-it';

@Component({
    selector: 'app-main-view',
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
    imports: [CommonModule, MarkdownComponent, ModalComponent, NoteWithContentFilterPipe]
})
export class MainViewComponent implements OnInit {

    @ViewChild('editor') editorRef!: ElementRef;

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

    quill: Quill;
    md = new MarkdownIt({ html: true, breaks: true });
    turndown = new TurndownService({
        bulletListMarker: '-'
    });

    // Angular 20 signal
    markdown = signal('');

    toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']];


    constructor(private releaseNotesService: ReleaseNotesService,
                private authenticationService: AuthenticationService,
                private modalService: ModalService,
                private toastr: ToastrService) {
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
        const content = this.quill.root.innerHTML;
        const normalizedHtml = this.normalizeQuillLists(content);
        this.activeReleaseNote.content = this.turndown.turndown(normalizedHtml);
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
        this.quill = new Quill(this.editorRef.nativeElement, { modules: { toolbar: this.toolbarOptions, keyboard: {
                bindings: {
                    softbreak: {
                    key: 13,
                    shiftKey: true,
                    handler: (range: any) => {
                        const quill = this.quill;
                        quill.insertEmbed(range.index, 'break', true, 'user');
                        quill.setSelection(range.index + 1, 0);
                        return false;
                    }
                    }
                }
            } 
            }, theme: 'snow'});
                this.syncToRichText();
                this.quill.on('text-change', () => {
                    this.releaseNotesService.setEditedContent(true);
                    this.releaseNotesService.setContent(this.quill.root.innerHTML);
            }
        );
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

    normalizedMarkdownContent(content: string): string {
        const rawContent = content ?? '';
        return rawContent
            // literal "\n\n" → <br> for a visible blank line
            .replace(/\s\n\n\s/g, '<br>');
    }

    private normalizeQuillLists(html: string): string {
        if (!html) {
            return '';
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.body;

        const processOrderedList = (list: HTMLOListElement) => {
            const parent = list.parentElement;
            if (!parent) {
                return;
            }

            const items = Array.from(list.children).filter(
                (el): el is HTMLLIElement => el.tagName === 'LI'
            );

            if (!items.length) {
                return;
            }

            const fragment = doc.createDocumentFragment();
            let currentList: HTMLOListElement | HTMLUListElement | null = null;
            let currentType: 'bullet' | 'ordered' | null = null;

            items.forEach(item => {
                const typeAttr = item.getAttribute('data-list');
                const type: 'bullet' | 'ordered' =
                    (typeAttr === 'bullet' || typeAttr === 'ordered')
                        ? typeAttr
                        : 'ordered';

                if (!currentList || type !== currentType) {
                    currentType = type;
                    currentList = doc.createElement(type === 'bullet' ? 'ul' : 'ol') as
                        | HTMLOListElement
                        | HTMLUListElement;
                    fragment.appendChild(currentList);
                }

                const li = item.cloneNode(true) as HTMLLIElement;
                li.removeAttribute('data-list');
                currentList.appendChild(li);
            });

            parent.replaceChild(fragment, list);
        };

        const orderedLists = Array.from(body.querySelectorAll('ol'));
        orderedLists.forEach(list => processOrderedList(list as HTMLOListElement));

        return body.innerHTML;
    }

    // Markdown → Quill
    private syncToRichText() {
        if (!this.quill) {
            return;
        }
        console.log( this.activeReleaseNote?.content);
        const normalizedMarkdownContent = this.normalizedMarkdownContent(this.activeReleaseNote?.content);
        let html = this.md.render(normalizedMarkdownContent);
        this.quill.clipboard.dangerouslyPasteHTML(html);
    }    

}
