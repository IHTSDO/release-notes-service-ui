import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { MarkdownModule} from "ngx-markdown";
import { provideToastr } from "ngx-toastr";

import { EnvServiceProvider } from "./providers/env.service.provider";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { headerInterceptorFn } from "./interceptors/header.interceptor";
import { authenticationInterceptorFn } from "./interceptors/authentication.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(BrowserModule, FormsModule, NgbTypeaheadModule, MarkdownModule.forRoot({ loader: HttpClient }), CdkDrag, CdkDropList),
        EnvServiceProvider,
        provideHttpClient(withInterceptors([headerInterceptorFn,authenticationInterceptorFn])),
        provideToastr(),
        provideRouter(routes),
       ] 
       
};


