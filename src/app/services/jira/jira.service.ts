import {Injectable} from '@angular/core';
import {Observable, Subject, Subscription} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ReleaseNotesService} from "../releaseNotes/release-notes.service";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class JiraService {

    activeVersion: any;
    activeVersionSubscription: Subscription;

    knownJiraIssues = new Subject();
    resolvedJiraIssues = new Subject();

    constructor(private http: HttpClient,
                private releaseNotesService: ReleaseNotesService) {
        this.activeVersionSubscription = this.releaseNotesService.getActiveVersion().subscribe(data => this.activeVersion = data);
    }

    setKnownJiraIssues(knownJiraIssues) {
        this.knownJiraIssues.next(knownJiraIssues);
    }

    getKnownJiraIssues() {
        return this.knownJiraIssues.asObservable();
    }

    setResolvedJiraIssues(resolvedJiraIssues) {
        this.resolvedJiraIssues.next(resolvedJiraIssues);
    }

    getResolvedJiraIssues() {
        return this.resolvedJiraIssues.asObservable();
    }

    httpGetKnownJiraIssues(): Observable<any> {
        return this.http.get<any>('/jira/issue/picker?query=“INT 20240201 - Known Issues (On Hold)” ORDER BY key ASC').pipe(map(data => {
            return data.sections[0].issues;
        }));
    }

    httpGetResolvedJiraIssues(): Observable<any> {
        return this.http.get<any>('/jira/issue/picker?query=“INT 20240201 - Resolved Issues” ORDER BY key ASC').pipe(map(data => {
            return data.sections[0].issues;
        }));
    }
}
