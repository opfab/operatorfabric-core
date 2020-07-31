/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Card, Detail} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {Map as OfMap} from '@ofModel/map';

export class Process {
    /* istanbul ignore next */
    constructor(
        readonly id: string,
        readonly version: string,
        readonly name?: I18n | string,
        readonly templates?: string[],
        readonly csses?: string[],
        readonly locales?: string[],
        readonly menuLabel?: string,
        readonly menuEntries?: MenuEntry[],
        readonly states?: OfMap<State>
    ) { if ( !(name instanceof I18n)) {
            name = new I18n(name);
    }
    }

    public extractState(card: Card): State {
        if (!!this.states && !!card.state && this.states[card.state]) {
            return this.states[card.state];
        } else {
            return null;
        }
    }
}

export const unfouundProcess: Process = new Process('', '', new I18n('process.not-found'),
     [], [], [], '', [], null);

export class MenuEntry {

    linkType: MenuEntryLinkTypeEnum = MenuEntryLinkTypeEnum.BOTH;

    /* istanbul ignore next */
    constructor(
        readonly id: string,
        readonly label: string,
        readonly url: string,
        linkType?: MenuEntryLinkTypeEnum
    ) {
    }
}

export enum MenuEntryLinkTypeEnum {
    TAB = 'TAB',
    IFRAME = 'IFRAME',
    BOTH = 'BOTH'
}

export class Menu {
    /* istanbul ignore next */
    constructor(
        readonly id: string,
        readonly version: string,
        readonly label: string,
        readonly entries: MenuEntry[]) {
    }
}

export class State {
    /* istanbul ignore next */
    constructor(
        readonly details?: Detail[],
        readonly response?: Response,
        readonly acknowledgementAllowed?: boolean,
        readonly name?: I18n,
        readonly color?: string
    ) {
    }
}

export class Response {
    /* istanbul ignore next */
    constructor(
        readonly lock?: boolean,
        readonly state?: string,
        readonly btnColor?: ResponseBtnColorEnum,
        readonly btnText?: I18n
    ) {
    }
}

export enum ResponseBtnColorEnum {
    RED = 'RED',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW'
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
