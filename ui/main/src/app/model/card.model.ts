/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Severity} from "@ofModel/light-card.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map";

export class Card {

    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly publisherVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
        readonly severity: Severity,
        readonly mainRecipient: string,
        readonly processId?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly  data?: any,
        readonly  details?: CardDetail[],
        readonly  actions?: Map<Action>
    ) {
    }
}

export enum TitlePosition {
    UP, DOWN, NONE

}

export class CardDetail {
    constructor(
        readonly titlePosition: TitlePosition,
        readonly title: I18n,
        readonly titleStyle: string,
        readonly templateName: string,
        readonly styles: string[]) {
    }
}

export enum ActionType {
    EXTERNAL,
    JNLP,
    URI

}

export class Action {
    constructor(
        readonly type: ActionType,
        readonly label: I18n,
        readonly hidden: boolean = false,
        readonly buttonStyle: string = '',
        readonly contentStyle: string = '',
        readonly inputs: Input[] = [],
        readonly lockAction: boolean = false,
        readonly lockCard: boolean = false,
        readonly updateState: boolean = false,
        readonly updateStateBeforeAction: boolean = false,
        readonly called: boolean = false,
        readonly needsConfirm: boolean = false,
    ) {
    }
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
    constructor(
        readonly label: I18n,
        readonly value: string,
    ) {
    }
}