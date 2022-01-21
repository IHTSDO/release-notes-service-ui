import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';

@Component({
    selector: 'app-left-sidebar',
    templateUrl: './left-sidebar.component.html',
    styleUrls: ['./left-sidebar.component.scss']
})
export class LeftSidebarComponent implements OnInit {

    textFilter: string;

    releaseNotes: any[];
    releaseNotesSubscription: Subscription;
    subjects: any[];
    subjectsSubscription: Subscription;
    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;

    constructor(private releaseNotesService: ReleaseNotesService) {
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
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

    selectReleaseNote(lineitem) {
        if (this.activeReleaseNote === lineitem) {
            this.releaseNotesService.setActiveReleaseNote(undefined);
        } else {
            this.releaseNotesService.setActiveReleaseNote(lineitem);
        }
    }
}
