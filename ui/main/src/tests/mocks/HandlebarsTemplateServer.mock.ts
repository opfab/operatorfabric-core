/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HandlebarsTemplateServer} from '@ofServices/handlebars/server/HandlebarsTemplateServer';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {Observable, of} from 'rxjs';

export class HandlebarsTemplateServerMock implements HandlebarsTemplateServer {
    private templateString = 'Data:{{card.data}}';
    private prefixWithParamsFormMethodCall = true;

    setResponseTemplateForGetTemplate(template: string, prefixWithParamsFormMethodCall: boolean = false) {
        this.templateString = template;
    }

    setTemplateResponseWithParamFromMethodCall(addParam: boolean) {
        this.prefixWithParamsFormMethodCall = addParam;
    }

    getTemplate(processid: string, processVersion: string, templateName: string): Observable<ServerResponse<string>> {
        let response = '';
        if (this.prefixWithParamsFormMethodCall) {
            response = `process:${processid},version:${processVersion},template:${templateName},`;
        }
        response += this.templateString;
        return of(new ServerResponse(response, ServerResponseStatus.OK, null));
    }
}
