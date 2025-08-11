import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';

import {map, catchError} from 'rxjs/operators';
import {AuthoringService} from "../services/authoring/authoring.service";
import { inject } from '@angular/core';


export const authenticationInterceptorFn : HttpInterceptorFn = (request,next ) => {

const authoringService=inject(AuthoringService);

  
        return next(request).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }),
            catchError(err => {
                if (err.status === 403) {
                    let config: any = {};
                    authoringService.getUIConfiguration().subscribe(data => {
                        config = data;
                        window.location.href =
                            config.endpoints.imsEndpoint
                            + 'login?serviceReferer='
                            + window.location.href;
                    });
                }
                throw err;
            })
        );
    };

