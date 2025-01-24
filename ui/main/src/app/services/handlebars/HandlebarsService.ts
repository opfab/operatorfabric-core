/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as Handlebars from 'handlebars/dist/handlebars.js';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {DetailContext} from '@ofServices/handlebars/model/DetailContext.model';
import {ConfigService} from 'app/services/config/ConfigService';
import {HandlebarsHelper} from './HandlebarsHelper';
import {HandlebarsAPI} from 'app/api/handlebars.api';
import {HandlebarsTemplateServer} from './server/HandlebarsTemplateServer';
import {ServerResponseStatus} from 'app/server/ServerResponse';

export class HandlebarsService {
    private static templateCache: Map<string, Function> = new Map();
    private static initDone = false;
    private static handlebarsTemplateServer: HandlebarsTemplateServer;

    public static setHandlebarsTemplateServer(handlebarsTemplateServer: HandlebarsTemplateServer) {
        HandlebarsService.handlebarsTemplateServer = handlebarsTemplateServer;
    }

    public static init() {
        if (!HandlebarsService.initDone) {
            HandlebarsHelper.init();
            ConfigService.getConfigValueAsObservable('settings.locale').subscribe((locale) => {
                HandlebarsHelper.changeLocale(locale);
            });

            HandlebarsAPI.getHandlebarHelpers().then((helpers) => {
                helpers?.forEach((helper) => {
                    Handlebars.registerHelper(helper.name, helper);
                });
            });

            HandlebarsService.initDone = true;
        }
    }

    public static executeTemplate(templateName: string, context: DetailContext): Observable<string> {
        return HandlebarsService.queryTemplate(context.card.process, context.card.processVersion, templateName).pipe(
            map((t) => t(context))
        );
    }

    public static queryTemplate(process: string, version: string, name: string): Observable<Function> {
        const key = `${process}.${version}.${name}`;
        const template = HandlebarsService.templateCache[key];
        if (template) {
            return of(template);
        }
        return HandlebarsService.fetchHbsTemplate(process, version, name).pipe(
            map((s) => Handlebars.compile(s)),
            tap((t) => (HandlebarsService.templateCache[key] = t))
        );
    }

    private static fetchHbsTemplate(process: string, version: string, name: string): Observable<string> {
        return HandlebarsService.handlebarsTemplateServer.getTemplate(process, version, name).pipe(
            map((serverResponse) => {
                if (serverResponse.status !== ServerResponseStatus.OK) throw new Error('Template not available');
                return serverResponse.data;
            })
        );
    }

    public static clearCache() {
        HandlebarsService.templateCache = new Map();
    }
}
