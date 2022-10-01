/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';

export class Process {
    constructor(
        readonly id: string,
        readonly version: string,
        readonly name?: string,
        readonly locales?: string[],
        readonly states?: Map<string,State>,
        readonly uiVisibility?: UiVisibility
    ) {}

    public extractState(card: Card | LightCard): State {
        if (!!this.states && !!card.state && this.states[card.state]) {
            return this.states[card.state];
        } else {
            return null;
        }
    }
}

export class UiVisibility {
    constructor(readonly monitoring: boolean, readonly logging: boolean, readonly calendar: boolean) {}
}

export class State {
    constructor(
        readonly templateName?: string,
        readonly styles?: string[],
        readonly response?: Response,
        readonly acknowledgmentAllowed?: AcknowledgmentAllowedEnum,
        readonly cancelAcknowledgmentAllowed?: boolean,
        readonly closeCardWhenUserAcknowledges?: boolean,
        readonly editCardEnabledOnUserInterface?: boolean,
        readonly deleteCardEnabledOnUserInterface?: boolean,
        readonly name?: string,
        readonly color?: string,
        readonly userCard?: UserCard,
        readonly description?: string,
        readonly showDetailCardHeader?: boolean,
        readonly type?: TypeOfStateEnum,
        readonly isOnlyAChildState?: boolean,
        readonly validateAnswerButtonLabel?: string,
        readonly modifyAnswerButtonLabel?: string,
        readonly automaticPinWhenAcknowledged?: boolean,
        readonly consideredAcknowledgedForUserWhen?: ConsideredAcknowledgedForUserWhenEnum
    ) {}
}

export class UserCard {
    constructor(
        readonly template?: string,
        readonly severityVisible?: boolean,
        readonly startDateVisible?: boolean,
        readonly endDateVisible?: boolean,
        readonly lttdVisible?: boolean,
        readonly recipientVisible?: boolean,
        readonly recipientList?: Recipient[]
    ) {}
}

export class Recipient {
    constructor(readonly id: string, readonly levels?: number[]) {}
}

export class Response {
    constructor(
        readonly lock?: boolean,
        readonly state?: string,
        readonly externalRecipients?: string[],
        readonly emittingEntityAllowedToRespond?: boolean
    ) {}
}

export enum AcknowledgmentAllowedEnum {
    ALWAYS = 'Always',
    NEVER = 'Never',
    ONLY_WHEN_RESPONSE_DISABLED_FOR_USER = 'OnlyWhenResponseDisabledForUser'
}

export enum TypeOfStateEnum {
    INPROGRESS = 'INPROGRESS',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED'
}

export enum ConsideredAcknowledgedForUserWhenEnum {
    USER_HAS_ACKNOWLEDGED = 'UserHasAcknowledged',
    ONE_ENTITY_OF_USER_HAS_ACKNOWLEDGED = 'OneEntityOfUserHasAcknowledged',
    ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED = 'AllEntitiesOfUserHaveAcknowledged'
}
