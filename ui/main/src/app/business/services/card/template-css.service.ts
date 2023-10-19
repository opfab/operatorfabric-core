/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {map, Observable, of} from 'rxjs';
import {Utilities} from 'app/business/common/utilities';
import {TemplateCssServer} from '../../server/template-css.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {LoggerService as logger} from '../logs/logger.service';

@Injectable({
    providedIn: 'root'
})
export class TemplateCssService {

    private styleContentCache: Map<string,string> = new Map();

    constructor(private templatecssServer: TemplateCssServer
        ) {}


    public getCssFilesContent(process: string, version: string, styleFileNames: string[]): Observable<string> {

        if (!styleFileNames) return of("");
        const styles: Observable<any>[] = new Array();
        styleFileNames.forEach(styleFileName => {
            const cacheKey = this.getCacheKey(process, version, styleFileName);
            if (!this.styleContentCache.has(cacheKey)) styles.push(this.loadCssFile(process, version, styleFileName));
        })
        if (styles.length > 0) return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(styles).pipe (map ( () => {
            return this.getCssContentFromCache(process,version,styleFileNames);
        }));
        else return of(this.getCssContentFromCache(process,version,styleFileNames));
    }

    private getCssContentFromCache (process: string, version: string, styleFileNames: string[]): string {
        let stylesContent = "";
        styleFileNames.forEach(styleFileName =>  {
            const cacheKey = this.getCacheKey(process, version, styleFileName);
            const styleContent = this.styleContentCache.get(cacheKey);
            if (cacheKey) stylesContent += '\n' + styleContent;

        });
        return stylesContent;
    }

    private loadCssFile(process: string, version: string, styleFileName: string): Observable<string> {
        return this.templatecssServer.loadCssFile(process, version, styleFileName).pipe(
            map( (responseServerStyleContent) => {
                if (responseServerStyleContent.status === ServerResponseStatus.OK) {
                    const url = this.getCacheKey(process, version, styleFileName);
                    this.styleContentCache.set(url, responseServerStyleContent.data);
                    return responseServerStyleContent.data;
                } else {
                    logger.error(`Impossible to load ${styleFileName} from process ${process} version ${version}`);
                    return '';
                }
        }));
    }

    public clearCache() {
        this.styleContentCache = new Map();
    }

    private getCacheKey(process, version, styleFileName): string {
        return process + "/" + version + "/" + styleFileName;
    }
}
