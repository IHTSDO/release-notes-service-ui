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
    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;

    constructor(private releaseNotesService: ReleaseNotesService) {
        this.releaseNotesSubscription = this.releaseNotesService.getReleaseNotes().subscribe( data => this.releaseNotes = data);
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
    }

    ngOnInit() {
        // this.releaseNotesService.httpGetReleaseNotes().subscribe(data => {
        //     this.releaseNotesService.setReleaseNotes(data);
        //     this.releaseNotesService.setActiveReleaseNote(data[0]);
        // });
    }

    selectReleaseNote(template) {
        if (this.activeReleaseNote === template) {
            this.releaseNotesService.setActiveReleaseNote(undefined);
        } else {
            this.releaseNotesService.setActiveReleaseNote(template);
        }
    }
}
