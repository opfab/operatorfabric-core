/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgmentAllowedEnum, Process} from '@ofServices/processes/model/Processes';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {Card} from 'app/model/Card';

export class AcknowledgePermission {
    public static isAcknowledgmentAllowed(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
        if (!processDefinition) return true;
        const state = processDefinition.states.get(card.state);

        if (!state?.acknowledgmentAllowed) return true;

        const isUserEnabledToRespond = UserPermissionsService.isUserEnabledToRespond(user, card, processDefinition);

        return (
            state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (user.permissions?.includes(PermissionEnum.READONLY) ||
                    !isUserEnabledToRespond ||
                    (isUserEnabledToRespond && AcknowledgePermission.isLttdExpired(card))))
        );
    }

    private static isLttdExpired(card: Card): boolean {
        return card.lttd != null && card.lttd - new Date().getTime() <= 0;
    }
}
