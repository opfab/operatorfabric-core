/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Card} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {Map as OfMap} from '@ofModel/map';

export class Process {
    /* istanbul ignore next */
    constructor(
        readonly id: string,
        readonly version: string,
        readonly name?: string,
        readonly locales?: string[],
        readonly states?: OfMap<State>,
        readonly uiVisibility?: UiVisibility
    ) {
    }

    public extractState(card: Card): State {
        if (!!this.states && !!card.state && this.states[card.state]) {
            return this.states[card.state];
        } else {
            return null;
        }
    }

}

export class UiVisibility {

    /* istanbul ignore next */
    constructor(
        readonly monitoring: boolean,
        readonly logging: boolean
    ) {
    }
}

export class State {
    /* istanbul ignore next */
    constructor(
        readonly templateName?: string,
        readonly styles?: string[],
        readonly response?: Response,
        readonly acknowledgmentAllowed?: AcknowledgmentAllowedEnum,
        readonly name?: string,
        readonly color?: string,
        readonly userCard?: UserCard,
        readonly description?: string,
        readonly showDetailCardHeader?: boolean
    ) {
    }
}

export class UserCard {
    constructor(
        readonly template?: string,
        readonly severityVisible?: boolean,
        readonly startDateVisible?: boolean,
        readonly endDateVisible?: boolean,
    ) {
    }
}
export class Response {
    /* istanbul ignore next */
    constructor(
        readonly lock?: boolean,
        readonly state?: string,
        readonly btnText?: I18n,
        readonly externalRecipients?: string[]
    ) {
    }
}



export enum AcknowledgmentAllowedEnum {
    ALWAYS = 'Always',
    NEVER = 'Never',
    ONLY_WHEN_RESPONSE_DISABLED_FOR_USER = 'OnlyWhenResponseDisabledForUser'
}

export enum InputType {
    TEXT,
    LIST,
    LIST_RADIO,
    SWITCH_LIST,
    LONGTEXT,
    BOOLEAN,
    STATIC
}

export class Input {
    /* istanbul ignore next */
    constructor(
        readonly type: InputType,
        readonly name: string,
        readonly label: I18n,
        readonly value: string,
        readonly mandatory: boolean,
        readonly maxLength: number,
        readonly rows: number,
        readonly values: ParameterListItem[],
        readonly selectedValues: string[],
        readonly unSelectedValues: string[],
    ) {
    }
}

export class ParameterListItem {
    /* istanbul ignore next */
    constructor(
        readonly label: I18n,
        readonly value: string,
    ) {
    }
}
