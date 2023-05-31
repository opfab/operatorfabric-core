/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Process {
    constructor(
        readonly id: string,
        readonly version: string,
        readonly name?: string,
        readonly locales?: string[],
        readonly states?: Map<string, State>,
        readonly uiVisibility?: UiVisibility
    ) {}
}

export class UiVisibility {
    constructor(readonly monitoring: boolean, readonly logging: boolean, readonly calendar: boolean) {}
}

export class State {
    constructor(
        public templateName?: string,
        public styles?: string[],
        public response?: Response,
        public acknowledgmentAllowed?: AcknowledgmentAllowedEnum,
        public cancelAcknowledgmentAllowed?: boolean,
        public closeCardWhenUserAcknowledges?: boolean,
        public editCardEnabledOnUserInterface?: boolean,
        public deleteCardEnabledOnUserInterface?: boolean,
        public name?: string,
        public color?: string,
        public userCard?: UserCard,
        public description?: string,
        public showDetailCardHeader?: boolean,
        public type?: TypeOfStateEnum,
        public isOnlyAChildState?: boolean,
        public validateAnswerButtonLabel?: string,
        public modifyAnswerButtonLabel?: string,
        public automaticPinWhenAcknowledged?: boolean,
        public consideredAcknowledgedForUserWhen?: ConsideredAcknowledgedForUserWhenEnum,
        public showAcknowledgmentFooter?: ShowAcknowledgmentFooterEnum
    ) {}
}

export class UserCard {
    constructor(
        readonly template?: string,
        readonly severityVisible?: boolean,
        readonly startDateVisible?: boolean,
        readonly endDateVisible?: boolean,
        readonly lttdVisible?: boolean,
        readonly expirationDateVisible?: boolean,
        readonly recipientVisible?: boolean,
        readonly recipientForInformationVisible?: boolean,
        readonly publisherList?: EntitiesTree[]
    ) {}
}

export class EntitiesTree {
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

export enum ShowAcknowledgmentFooterEnum {
    ONLY_FOR_EMITTING_ENTITY = 'OnlyForEmittingEntity',
    ONLY_FOR_USERS_ALLOWED_TO_EDIT = 'OnlyForUsersAllowedToEdit',
    FOR_ALL_USERS = 'ForAllUsers',
    NEVER = 'Never'
}
