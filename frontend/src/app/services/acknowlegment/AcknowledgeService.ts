/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, map} from 'rxjs';
import {AcknowledgeServer} from './server/AcknowledgeServer';
import {ServerResponse, ServerResponseStatus} from '../../server/ServerResponse';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UsersService} from '@ofServices/users/UsersService';
import {AcknowledgeUtils} from './AcknowledgeUtils';
import {OpfabStore} from '@ofStore/OpfabStore';
import {CardAction} from 'app/model/CardAction';
import {Card} from 'app/model/Card';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';

export class AcknowledgeService {
    private static acknowledgeServer: AcknowledgeServer;

    public static setAcknowledgeServer(acknowledgeServer: AcknowledgeServer) {
        AcknowledgeService.acknowledgeServer = acknowledgeServer;
    }

    public static deleteAcknowledgement(card: Card) {
        return AcknowledgeService.acknowledgeServer
            .deleteUserAcknowledgement(card.uid, AcknowledgeService.getAcknowledgedEntities())
            .pipe(
                map((serverResponse) => {
                    if (serverResponse.status === ServerResponseStatus.OK) {
                        OpfabStore.getLightCardStore().setLightCardAcknowledgment(card.id, false);
                        AcknowledgeService.deleteAcknowledgmentForChildCards(card);
                    } else {
                        logger.error(
                            `The remote acknowledgement endpoint returned an error status(${serverResponse.status})`,
                            LogOption.LOCAL_AND_REMOTE
                        );
                    }
                    return serverResponse;
                })
            );
    }

    public static postAcknowledgement(card: Card): Observable<ServerResponse<void>> {
        return AcknowledgeService.acknowledgeServer
            .postUserAcknowledgement(card.uid, AcknowledgeService.getAcknowledgedEntities())
            .pipe(
                map((serverResponse) => {
                    if (serverResponse.status === ServerResponseStatus.OK) {
                        OpfabStore.getLightCardStore().setLightCardAcknowledgment(card.id, true);
                        AcknowledgeService.postAcknowledgmentForChildCards(card);
                    } else {
                        logger.error(
                            `The remote acknowledgement endpoint returned an error status(${serverResponse.status})`,
                            LogOption.LOCAL_AND_REMOTE
                        );
                    }
                    return serverResponse;
                })
            );
    }

    private static postAcknowledgmentForChildCards(card: Card) {
        const childCards = OpfabStore.getLightCardStore().getChildCards(card.id);
        if (childCards) {
            childCards.forEach((child: Card) => {
                if (child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                    AcknowledgeService.postAcknowledgement(child).subscribe();
                }
            });
        }
    }

    private static deleteAcknowledgmentForChildCards(card: Card) {
        const childCards = OpfabStore.getLightCardStore().getChildCards(card.id);
        if (childCards) {
            childCards.forEach((child: Card) => {
                if (child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                    AcknowledgeService.deleteAcknowledgement(child).subscribe();
                }
            });
        }
    }

    private static getAcknowledgedEntities(): string[] {
        if (!UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]))
            return AcknowledgeUtils.getCurrentUserEntitiesAllowedToAcknowledge();
        return [];
    }
}
