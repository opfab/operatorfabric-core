/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {AngularServer} from '../../../server/AngularServer';
import {ServerResponse} from 'app/server/ServerResponse';
import {TemplateCssServer} from '@ofServices/templateCss/server/TemplateCssServer';

@Injectable({
    providedIn: 'root'
})
export class AngularTemplateCssServer extends AngularServer implements TemplateCssServer {
    private readonly httpClient = inject(HttpClient);

    private readonly processesUrl;

    constructor() {
        super();
        this.processesUrl = `${environment.url}businessconfig/processes`;
    }

    loadCssFile(process: string, version: string, styleFileName: string): Observable<ServerResponse<string>> {
        const url = this.computeBusinessconfigCssUrl(process, styleFileName, version);
        return this.processHttpResponse(this.httpClient.get(url, {responseType: 'text'}));
    }

    computeBusinessconfigCssUrl(process: string, styleName: string, version: string): string {
        const resourceUrl = `${this.processesUrl}/${encodeURIComponent(process)}/css/${encodeURIComponent(styleName)}`;
        const versionParam = new HttpParams().set('version', version);
        return `${resourceUrl}?${versionParam.toString()}`;
    }
}
