/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '@env/environment';

export const implicitAuthenticationConfigFallback: AuthConfig = {
    issuer: 'http://localhost:89/auth/realms/dev',
    redirectUri: window.location.origin + environment.urls.authentication,
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    clientId: 'opfab-client',
    scope: 'openid profile email',
    showDebugInformation: false,
    sessionChecksEnabled: false
};
