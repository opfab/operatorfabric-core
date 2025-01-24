/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {catchError, map, Observable, of} from 'rxjs';

export class AngularServer {
    protected processHttpResponse<dataType>(httpResponse: Observable<dataType>): Observable<ServerResponse<dataType>> {
        return httpResponse.pipe(
            map((data) => {
                return new ServerResponse(data, ServerResponseStatus.OK, '');
            }),
            catchError((httpErrorResponse) => {
                let serverStatus = ServerResponseStatus.UNKNOWN_ERROR;
                if (httpErrorResponse.status === 404) serverStatus = ServerResponseStatus.NOT_FOUND;
                else if (httpErrorResponse.status === 403) serverStatus = ServerResponseStatus.FORBIDDEN;
                else if (httpErrorResponse.status === 400) serverStatus = ServerResponseStatus.BAD_REQUEST;

                const errorMessage = httpErrorResponse.error?.message ?? '';
                return of(new ServerResponse(null, serverStatus, errorMessage));
            })
        );
    }
}
