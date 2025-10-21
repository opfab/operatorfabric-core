/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgeServer} from '@ofServices/acknowlegment/server/AcknowledgeServer';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {Observable, of} from 'rxjs';

export class AcknowledgeServerMock implements AcknowledgeServer {
    public ackPosted = new Array<{cardUid: string; entitiesAcks: string[]}>();
    public ackDeleted = new Array<{cardUid: string; entitiesAcks: string[]}>();
    public serverResponseStatus = ServerResponseStatus.OK;

    postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        this.ackPosted.push({cardUid, entitiesAcks});
        return of(new ServerResponse<void>(null, this.serverResponseStatus, 'OK'));
    }
    deleteUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        this.ackDeleted.push({cardUid, entitiesAcks});
        return of(new ServerResponse<void>(null, this.serverResponseStatus, 'OK'));
    }
}
