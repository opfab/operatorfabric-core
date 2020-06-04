

import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from './authentication/authentication.service';

@Injectable()
export class TokenInjector implements HttpInterceptor {
    constructor(private authService: AuthenticationService) {
    }

    /* istanbul ignore next */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.addAuthHeadersIfNecessary(request));
    }


    addAuthHeadersIfNecessary(request: HttpRequest<any>): HttpRequest<any> {
        const url = request.url;

        const notCheckTokenRequest = !(url.endsWith('/auth/check_token') || url.endsWith('/auth/token') || url.endsWith('/auth/code'));
        if (notCheckTokenRequest) {
            const securityHeader = this.authService.getSecurityHeader();
            const update = {setHeaders: securityHeader};
            request = request.clone(update);
        }
        return request;
    }
}
