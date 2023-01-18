/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {map, Observable, of, skip, tap} from 'rxjs';
import {HttpClient, HttpUrlEncodingCodec, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Utilities} from 'app/business/common/utilities';

@Injectable({
    providedIn: 'root'
})
export class TemplateCssService {
    private processesUrl;
    private urlCleaner: HttpUrlEncodingCodec;
    private styleContentCache: Map<String,String> = new Map();

    constructor(private httpClient: HttpClient) {
        this.processesUrl = `${environment.urls.processes}`;
        this.urlCleaner = new HttpUrlEncodingCodec();
    }


    public getCssFilesContent(process: string, version: string, styleFileNames: string[]): Observable<string> {

        if (!styleFileNames) return of("");
        const styles: Observable<any>[] = new Array();
        styleFileNames.forEach(styleFileName => {
            const styleUrl = this.computeBusinessconfigCssUrl(process, styleFileName, version);
            if (!this.styleContentCache.has(styleUrl)) styles.push(this.loadCssFile(styleUrl));
        })
        if (styles.length > 0) return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(styles).pipe (map ( () => {
            return this.getCssContentFromCache(process,version,styleFileNames);
        }));
        else return of(this.getCssContentFromCache(process,version,styleFileNames));
    }

    private getCssContentFromCache (process: string, version: string, styleFileNames: string[]): string {
        let stylesContent = "";
        styleFileNames.forEach(styleFileName =>  {
            const styleUrl = this.computeBusinessconfigCssUrl(process, styleFileName, version);
            const styleContent = this.styleContentCache.get(styleUrl);
            if (!!styleUrl) stylesContent += '\n' + styleContent;

        });
        return stylesContent;
    }


    private loadCssFile(url: string): Observable<string> {
        return this.httpClient.get(url,{responseType:'text'}).pipe(map( (styleContent) => {
            this.styleContentCache.set(url,styleContent)
            return styleContent;
        }));
    }

    private computeBusinessconfigCssUrl(process: string, styleName: string, version: string): string {
        // manage url character encoding
        const resourceUrl = this.urlCleaner.encodeValue(`${this.processesUrl}/${process}/css/${styleName}`);
        const versionParam = new HttpParams().set('version', version);
        return `${resourceUrl}?${versionParam.toString()}`;
    }

    public clearCache() {
        this.styleContentCache = new Map();
    }
}
