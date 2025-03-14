/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {AcknowledgeServer} from './server/AcknowledgeServer';
import {ServerResponse} from '../../server/ServerResponse';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UsersService} from '@ofServices/users/UsersService';
import {AcknowledgeUtils} from './AcknowledgeUtils';

export class AcknowledgeService {
    private static acknowledgeServer: AcknowledgeServer;

    public static setAcknowledgeServer(acknowledgeServer: AcknowledgeServer) {
        AcknowledgeService.acknowledgeServer = acknowledgeServer;
    }

    public static deleteAcknowledgement(cardUid: string) {
        return AcknowledgeService.acknowledgeServer.deleteUserAcknowledgement(
            cardUid,
            AcknowledgeService.getAcknowledgedEntities()
        );
    }

    public static postAcknowledgement(cardUid: string): Observable<ServerResponse<void>> {
        return AcknowledgeService.acknowledgeServer.postUserAcknowledgement(
            cardUid,
            AcknowledgeService.getAcknowledgedEntities()
        );
    }

    private static getAcknowledgedEntities(): string[] {
        if (!UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]))
            return AcknowledgeUtils.getCurrentUserEntitiesAllowedToAcknowledge();
        return [];
    }
}
