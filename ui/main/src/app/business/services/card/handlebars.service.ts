/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {DetailContext} from '@ofModel/detail-context.model';
import {ConfigService} from 'app/business/services/config.service';
import {HandlebarsHelper} from './handlebarsHelper';
import {HandlebarsAPI} from 'app/api/handlebars.api';

export class HandlebarsService {
    private static templateCache: Map<string, Function> = new Map();
    private static initDone = false;

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
        return ProcessesService.fetchHbsTemplate(process, version, name).pipe(
            map((s) => Handlebars.compile(s)),
            tap((t) => (HandlebarsService.templateCache[key] = t))
        );
    }

    public static clearCache() {
        HandlebarsService.templateCache = new Map();
    }
}
