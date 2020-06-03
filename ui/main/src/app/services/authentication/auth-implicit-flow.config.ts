
import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '@env/environment';

export const implicitAuthenticationConfigFallback: AuthConfig = {
    issuer: 'http://localhost:89/auth/realms/dev',
    redirectUri: window.location.origin + environment.urls.authentication,
    silentRefreshRedirectUri: window.location.origin + getPathEnd() + '/silent-refresh.html',
    clientId: 'opfab-client',
    scope: 'openid profile email',
    showDebugInformation: false,
    sessionChecksEnabled: false
};

function getPathEnd()
{
 return  (location.pathname.length > 1) ? location.pathname : '';
}
