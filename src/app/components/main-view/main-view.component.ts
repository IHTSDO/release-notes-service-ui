import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {ModalService} from '../../services/modal/modal.service';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-main-view',
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

    toastrConfig = {
        closeButton: true
    };

    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;
    releaseNotes: any[];
    releaseNotesSubscription: Subscription;
    user: any;
    userSubscription: Subscription;
    editedContent: any;
    editedContentSubscription: Subscription;
    editMode: any;
    editModeSubscription: Subscription;

    constructor(private releaseNotesService: ReleaseNotesService,
                private authenticationService: AuthenticationService,
                private modalService: ModalService,
                private toastr: ToastrService) {
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.editedContentSubscription = this.releaseNotesService.getEditedContent().subscribe(data => this.editedContent = data);
        this.editModeSubscription = this.releaseNotesService.getEditMode().subscribe(data => this.editMode = data);
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
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
        this.releaseNotesService.httpPutReleaseNote(this.activeReleaseNote).subscribe(data => {
            this.releaseNotesService.setEditedContent(false);
            this.toastr.success('Release Note: ' + data['title'], 'SAVED', this.toastrConfig);
        });
    }

    setEditedContent(value: boolean): void {
        this.releaseNotesService.setEditedContent(value);
    }

    editToggle(): void {
        if (this.editMode) {
            this.editMode = false;
        } else {
            this.editMode = true;
        }
    }

    public openPDF(): void {
        const data = document.getElementById('pdf-view');

        html2canvas(data).then(canvas => {

            const fileWidth = 208;
            const fileHeight = canvas.height * fileWidth / canvas.width;

            const FILEURI = canvas.toDataURL('image/png');
            const PDF = new jsPDF('p', 'mm', 'a4');
            PDF.addImage(FILEURI, 'PNG', 0, 0, fileWidth, fileHeight);

            PDF.save('angular-demo.pdf');
        });
    }
}
