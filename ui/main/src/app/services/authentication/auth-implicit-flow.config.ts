/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

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

function getPathEnd() {
    return location.pathname.length > 1 ? location.pathname : '';
}
