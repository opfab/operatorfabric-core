/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map, Observable, of} from 'rxjs';
import {Utilities} from 'app/business/common/utilities';
import {TemplateCssServer} from '../../server/template-css.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class TemplateCssService {
    private static templatecssServer: TemplateCssServer;
    private static styleContentCache: Map<string, string> = new Map();

    public static setTemplatecssServer(templatecssServer: TemplateCssServer) {
        TemplateCssService.templatecssServer = templatecssServer;
    }

    public static getCssFilesContent(process: string, version: string, styleFileNames: string[]): Observable<string> {
        if (!styleFileNames) return of('');
        const styles: Observable<any>[] = new Array();
        styleFileNames.forEach((styleFileName) => {
            const cacheKey = TemplateCssService.getCacheKey(process, version, styleFileName);
            if (!TemplateCssService.styleContentCache.has(cacheKey))
                styles.push(TemplateCssService.loadCssFile(process, version, styleFileName));
        });
        if (styles.length > 0)
            return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(styles).pipe(
                map(() => {
                    return TemplateCssService.getCssContentFromCache(process, version, styleFileNames);
                })
            );
        else return of(TemplateCssService.getCssContentFromCache(process, version, styleFileNames));
    }

    private static getCssContentFromCache(process: string, version: string, styleFileNames: string[]): string {
        let stylesContent = '';
        styleFileNames.forEach((styleFileName) => {
            const cacheKey = TemplateCssService.getCacheKey(process, version, styleFileName);
            const styleContent = TemplateCssService.styleContentCache.get(cacheKey);
            if (cacheKey) stylesContent += '\n' + styleContent;
        });
        return stylesContent;
    }

    private static loadCssFile(process: string, version: string, styleFileName: string): Observable<string> {
        return TemplateCssService.templatecssServer.loadCssFile(process, version, styleFileName).pipe(
            map((responseServerStyleContent) => {
                if (responseServerStyleContent.status === ServerResponseStatus.OK) {
                    const url = TemplateCssService.getCacheKey(process, version, styleFileName);
                    TemplateCssService.styleContentCache.set(url, responseServerStyleContent.data);
                    return responseServerStyleContent.data;
                } else {
                    logger.error(`Impossible to load ${styleFileName} from process ${process} version ${version}`);
                    return '';
                }
            })
        );
    }

    public static clearCache() {
        TemplateCssService.styleContentCache = new Map();
    }

    private static getCacheKey(process, version, styleFileName): string {
        return process + '/' + version + '/' + styleFileName;
    }
}
