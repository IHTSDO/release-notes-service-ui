import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Component({
    selector: 'app-main-view',
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

    activeReleaseNote: any;
    activeReleaseNoteSubscription: Subscription;
    user: any;
    userSubscription: Subscription;

    constructor(private releaseNotesService: ReleaseNotesService, private authenticationService: AuthenticationService) {
        this.activeReleaseNoteSubscription = this.releaseNotesService.getActiveReleaseNote().subscribe( data => this.activeReleaseNote = data);
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
    }

    ngOnInit(): void {
    }

    flick(): void {
        if (this.user) {
            this.user = undefined;
        } else {
            this.authenticationService.setUser();
        }
    }
}
