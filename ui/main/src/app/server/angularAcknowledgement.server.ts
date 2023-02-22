/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {AngularServer} from './angular.server';
import {AcknowledgeServer} from 'app/business/server/acknowledge.server';
import {ServerResponse} from 'app/business/server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class AngularAcknowledgeServer extends AngularServer implements AcknowledgeServer {
    readonly userAckUrl: string;

    constructor(
        private httpClient: HttpClient,
    ) {
        super();
        this.userAckUrl = `${environment.urls.cardspub}/cards/userAcknowledgement`;
    }

    postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        return this.processHttpResponse(
            this.httpClient.post<void>(`${this.userAckUrl}/${cardUid}`, entitiesAcks)
            );
    }

    deleteUserAcknowledgement(cardUid: string): Observable<ServerResponse<void>> {
        return this.processHttpResponse(this.httpClient.delete<void>(`${this.userAckUrl}/${cardUid}`));
    }


}
