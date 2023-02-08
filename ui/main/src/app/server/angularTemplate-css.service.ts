/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpUrlEncodingCodec, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {AngularServer} from './angular.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {TemplateCssServer} from 'app/business/server/template-css.server';

@Injectable({
    providedIn: 'root'
})
export class AngularTemplateCssServer extends AngularServer implements TemplateCssServer{
    private processesUrl;
    private urlCleaner: HttpUrlEncodingCodec;

    constructor(private httpClient: HttpClient) {
        super();
        this.processesUrl = `${environment.urls.processes}`;
        this.urlCleaner = new HttpUrlEncodingCodec();
    }

    loadCssFile(process: string, version: string, styleFileName: string): Observable<ServerResponse<string>> {
        const url = this.computeBusinessconfigCssUrl(process, styleFileName, version);
        return this.processHttpResponse(this.httpClient.get(url,{responseType:'text'}));
    }

    computeBusinessconfigCssUrl(process: string, styleName: string, version: string): string {
        // manage url character encoding
        const resourceUrl = this.urlCleaner.encodeValue(`${this.processesUrl}/${process}/css/${styleName}`);
        const versionParam = new HttpParams().set('version', version);
        return `${resourceUrl}?${versionParam.toString()}`;
    }
}
