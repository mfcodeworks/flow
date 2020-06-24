import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private auth: AuthService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Only add auth to requests for our API
        return request.url.startsWith(environment.apiUrl)
            ? this.auth.isLoggedIn().pipe(
                // Add token based on logged in status
                map(u => !!this.auth.getToken() ? `Bearer ${this.auth.getToken()}` : ''),
                map((Authorization: string) =>
                    request.clone(Authorization ? {
                        setHeaders: { Authorization },
                        withCredentials: true
                    } : undefined)
                ),
                switchMap(r => next.handle(r))
            // Forward non-API requests as default
            ) : next.handle(request);
    }
}
