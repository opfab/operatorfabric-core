import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '@env/environment';

export const implicitAuthenticationConfigFallback: AuthConfig = {
    issuer: 'http://localhost:89/auth/realms/dev',
    redirectUri: window.location.origin + environment.urls.authentication,
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    clientId: 'opfab-client',
    scope: 'openid profile email',
    showDebugInformation: true,
    sessionChecksEnabled: false
};
