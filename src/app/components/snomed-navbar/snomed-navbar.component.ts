import { Component, OnInit } from '@angular/core';
import { Subscription} from 'rxjs';
import { User } from '../../models/user';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import {PathingService} from '../../services/pathing/pathing.service';
import { Location, CommonModule } from '@angular/common';
import {ReleaseNotesService} from '../../services/releaseNotes/release-notes.service';
import {JiraService} from "../../services/jira/jira.service";
import { RouterLink } from '@angular/router';
import { ReverseAlphabeticalPipe } from '../../pipes/reverse-alphabetical/reverse-alphabetical.pipe';
import {ConfigService} from "../../services/config.service";
import {DrawerService} from "../../services/drawer.service";

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss'],
    imports: [RouterLink, CommonModule, ReverseAlphabeticalPipe]
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;
    path: string;

    user: User;
    userSubscription: Subscription;

    versions: any;
    versionsSubscription: Subscription;
    activeVersion: any;
    activeVersionSubscription: Subscription;

    knownJiraIssues: any;
    knownJiraIssuesSubscription: Subscription;
    resolvedJiraIssues: any;
    resolvedJiraIssuesSubscription: Subscription;

    constructor(private authenticationService: AuthenticationService,
                private pathingService: PathingService,
                private releaseNotesService: ReleaseNotesService,
                private drawerService: DrawerService,
                private configService: ConfigService,
                private jiraService: JiraService,
                private location: Location) {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
        this.versionsSubscription = this.releaseNotesService.getVersions().subscribe(data => this.versions = data);
        this.activeVersionSubscription = this.releaseNotesService.getActiveVersion().subscribe(data => this.activeVersion = data);
        this.knownJiraIssuesSubscription = this.jiraService.getKnownJiraIssues().subscribe(data => this.knownJiraIssues = data);
        this.resolvedJiraIssuesSubscription = this.jiraService.getResolvedJiraIssues().subscribe(data => this.resolvedJiraIssues = data);
    }

    ngOnInit() {
        // this.authenticationService.httpGetUser().subscribe(user => {
        //     this.authenticationService.setUser(user);
        //
        //     this.authenticationService.httpGetRoles().subscribe(roles => {
        //         this.authenticationService.setRoles(roles['userRoles']);
        //     });
        // });
        this.path = this.location.path();

        this.releaseNotesService.httpGetVersions().subscribe(versions => {
            this.releaseNotesService.setVersions(versions);
        });
        this.pathingService.setActiveVersion('MAIN');
    }

    openDrawer() {
        this.drawerService.setDrawerOpen(true);
        document.body.classList.add('app-drawer-open');
    }

    setActiveVersion(version) {
        this.releaseNotesService.setActiveVersion(version);
    }

    logout() {
        this.authenticationService.logout();
    }
}
