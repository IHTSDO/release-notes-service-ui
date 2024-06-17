import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderInterceptor } from './interceptors/header.interceptor';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { SnomedNavbarComponent } from './components/snomed-navbar/snomed-navbar.component';
import { SnomedFooterComponent } from './components/snomed-footer/snomed-footer.component';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthoringService } from './services/authoring/authoring.service';
import { EnvServiceProvider } from './providers/env.service.provider';
import {ToastrModule} from 'ngx-toastr';
import {StatusPageService} from './services/statusPage/status-page.service';
import {PathingService} from './services/pathing/pathing.service';
import {AlphabeticalPipe} from './pipes/alphabetical/alphabetical.pipe';
import {BranchPipe} from './pipes/branch/branch.pipe';
import {ProjectPipe} from './pipes/project/project.pipe';
import {AppRoutingModule} from './app-routing.module';
import {ModalService} from './services/modal/modal.service';
import {ReverseAlphabeticalPipe} from './pipes/reverse-alphabetical/reverse-alphabetical.pipe';
import {LeftSidebarComponent} from './components/left-sidebar/left-sidebar.component';
import {ReleaseNotesService} from './services/releaseNotes/release-notes.service';
import {TextFilterPipe} from './pipes/text-filter/text-filter.pipe';
import { MainViewComponent } from './components/main-view/main-view.component';
import {ModalComponent} from './components/modal/modal.component';
import { TopLevelPipe } from './pipes/top-level/top-level.pipe';
import {MarkdownModule} from "ngx-markdown";
import {AuthenticationInterceptor} from "./interceptors/authentication.interceptor";
import { SortPipe } from './pipes/sort/sort.pipe';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        AppComponent,
        SnomedNavbarComponent,
        SnomedFooterComponent,
        AlphabeticalPipe,
        ReverseAlphabeticalPipe,
        BranchPipe,
        ProjectPipe,
        LeftSidebarComponent,
        TextFilterPipe,
        MainViewComponent,
        ModalComponent,
        TopLevelPipe,
        SortPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgbTypeaheadModule,
        AppRoutingModule,
        ToastrModule.forRoot(),
        MarkdownModule.forRoot({ loader: HttpClient }),
        CdkDrag,
        CdkDropList
    ],
    providers: [
        AuthenticationService,
        AuthoringService,
        StatusPageService,
        ModalService,
        PathingService,
        ReleaseNotesService,
        EnvServiceProvider,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HeaderInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthenticationInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
