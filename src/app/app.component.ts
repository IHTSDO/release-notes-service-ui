import { Component, OnInit } from '@angular/core';
import 'jquery';
import { Title } from '@angular/platform-browser';
import { AuthoringService } from './services/authoring/authoring.service';
import { BranchingService } from './services/branching/branching.service';
import { EnvService } from './services/environment/env.service';
import { ToastrService } from 'ngx-toastr';
import {StatusPageService} from './services/statusPage/status-page.service';
import {Observable} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, switchMap, tap, filter, map} from 'rxjs/operators';
import {TerminologyServerService} from './services/terminologyServer/terminology-server.service';
import { SnomedNavbarComponent } from './components/snomed-navbar/snomed-navbar.component';
import { LeftSidebarComponent } from './components/left-sidebar/left-sidebar.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { SnomedFooterComponent } from './components/snomed-footer/snomed-footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [SnomedNavbarComponent, LeftSidebarComponent, MainViewComponent, SnomedFooterComponent]
})
export class AppComponent implements OnInit {

    versions: object;
    environment: string;
    toastrConfig = {
        closeButton: true,
        disableTimeOut: true
    };

    scheduledAlerts: any[] = [];
    basicTypeahead: string;
    spinner = document.createElement('div');

    search = (text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        filter((text) => text.length > 2),
        distinctUntilChanged(),
        tap(() => document.activeElement.parentElement.appendChild(this.spinner)),
        switchMap(term => this.terminologyService.getTypeahead(term)
            .pipe(tap(() => document.getElementById('spinner').remove()))
        ),
        catchError(tap(() => document.getElementById('spinner').remove()))
    )

    constructor(private authoringService: AuthoringService,
                private branchingService: BranchingService,
                private envService: EnvService,
                private toastr: ToastrService,
                private titleService: Title,
                private statusService: StatusPageService,
                private terminologyService: TerminologyServerService) {
        this.spinner.id = 'spinner';
        this.spinner.classList.add('spinner-border', 'spinner-border-sm', 'text-slate-grey', 'position-absolute');
        this.spinner.style.top = '7px';
        this.spinner.style.right = '7px';
    }

    ngOnInit() {
        this.titleService.setTitle('SNOMED CT Release Notes');
        this.environment = this.envService.env;

        this.authoringService.getVersions().subscribe(versions => {
            this.versions = versions;
        });

        this.authoringService.getUIConfiguration().subscribe(config => {
            this.authoringService.uiConfiguration = config;
        });

        this.branchingService.setBranchPath('MAIN');
        this.assignFavicon();

        // this.checkSchedule();
        // setInterval(() => this.checkSchedule(), 60000);
    }

    checkSchedule() {
        this.statusService.getSchedule().subscribe(schedule => {
            this.calculateSchedule(schedule['scheduled_maintenances']);
        });
    }

    calculateSchedule(schedule) {
        const currentTime = new Date().getTime();

        schedule.forEach(item => {
            if (!this.scheduledAlerts.some(storedItem => storedItem.id === item.id)) {
                if (item.status === 'scheduled') {
                    this.toastr.info(item.incident_updates[0].body, 'NEW MAINTENANCE', this.toastrConfig);
                }
            }

            const scheduledTime = new Date(item.scheduled_for).getTime();

            if (this.schedule10minCheck(currentTime, scheduledTime)) {
                this.toastr.warning(item.incident_updates[0].body, '10 MINS', this.toastrConfig);
            }

            if (this.schedule5minCheck(currentTime, scheduledTime)) {
                this.toastr.warning(item.incident_updates[0].body, '5 MINS', this.toastrConfig);
            }

            if (this.schedule1minCheck(currentTime, scheduledTime)) {
                this.toastr.warning(item.incident_updates[0].body, '1 MIN', this.toastrConfig);
            }

            this.scheduledAlerts.forEach(storedAlert => {
                if (storedAlert.id === item.id) {
                    if (storedAlert.status === 'scheduled' && item.status === 'in_progress') {
                        this.toastr.info(item.incident_updates[0].body, 'MAINTENANCE STARTED', this.toastrConfig);
                    }

                    if (storedAlert.status !== 'completed' && item.status === 'completed') {
                        this.toastr.info(item.incident_updates[0].body, 'MAINTENANCE COMPLETE', this.toastrConfig);
                    }
                }
            });
        });

        // this.scheduledAlerts.forEach(storedAlert => {
        //     if (!schedule.some(item => item.id === storedAlert.id)) {
        //         this.toastr.info(storedAlert.incident_updates[0].body, 'CANCELLED', this.toastrConfig);
        //     }
        // });

        if (JSON.stringify(schedule) !== JSON.stringify(this.scheduledAlerts)) {
            this.scheduledAlerts = schedule;
        }
    }

    schedule10minCheck(currentTime, scheduledTime): boolean {
        return currentTime > (scheduledTime - 660000) && currentTime < (scheduledTime - 600000);
    }

    schedule5minCheck(currentTime, scheduledTime): boolean {
        return currentTime > (scheduledTime - 360000) && currentTime < (scheduledTime - 300000);
    }

    schedule1minCheck(currentTime, scheduledTime): boolean {
        return currentTime > (scheduledTime - 120000) && currentTime < (scheduledTime - 60000);
    }

    toastrSuccess() {
        this.toastr.success('Message data goes here', 'SUCCESS', this.toastrConfig);
    }

    toastrWarning() {
        this.toastr.warning('Message data goes here', 'WARNING', this.toastrConfig);
    }

    toastrError() {
        this.toastr.error('Message data goes here', 'ERROR', this.toastrConfig);
    }

    toastrInfo() {
        this.toastr.info('Message data goes here', 'INFO', this.toastrConfig);
    }

    toastrShow() {
        this.toastr.show('Message data goes here', 'SHOW', this.toastrConfig);
    }

    assignFavicon() {
        const favicon = $('#favicon');

        switch (this.environment) {
            case 'local':
                favicon.attr('href', 'favicon_grey.ico');
                break;
            case 'dev':
                favicon.attr('href', 'favicon_red.ico');
                break;
            case 'uat':
                favicon.attr('href', 'favicon_green.ico');
                break;
            case 'training':
                favicon.attr('href', 'favicon_yellow.ico');
                break;
            default:
                favicon.attr('href', 'favicon.ico');
                break;
        }
    }

    cloneObject(object): any {
        return JSON.parse(JSON.stringify(object));
    }
}
