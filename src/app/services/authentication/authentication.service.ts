import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { Subject } from 'rxjs';
import { AuthoringService } from '../authoring/authoring.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private user = new Subject<User>();
    private roles = new Subject<any>();

    constructor(private http: HttpClient, private authoringService: AuthoringService) {
    }

    setRoles(roles) {
        this.roles.next(roles);
    }

    getRoles() {
        return this.roles.asObservable();
    }

    httpGetRoles() {
        return this.http.get('/snowstorm/snomed-ct/branches/MAIN');
    }

    setUser(user) {
        this.user.next(user);
    }

    getUser() {
        return this.user.asObservable();
    }

    httpGetUser() {
        return this.http.get<User>('/auth');
    }

    logout() {
        window.location.href =
            this.authoringService.uiConfiguration.endpoints.imsEndpoint + 'logout?serviceReferer=' + window.location.href;
    }
}
