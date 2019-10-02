/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Card, Detail} from "@ofModel/card.model";
import {I18n} from "@ofModel/i18n.model";
import {Map as OfMap} from "@ofModel/map";

export class Third{
    /* istanbul ignore next */
    constructor(
        readonly name:string,
        readonly version:string,
        readonly i18nLabelKey: string,
        readonly templates?:string[],
        readonly csses?:string[],
        readonly locales?:string[],
        readonly menuEntries?:ThirdMenuEntry[],
        readonly processes?:OfMap<Process>
    ){}

    public extractState(card:Card):State{
        if(card.process && this.processes[card.process]) {
            const process = this.processes[card.process];
            if(card.state && process.states[card.state]) {
               return process.states[card.state];
            }
        }
        return null;
    }
}

export class ThirdMenuEntry{
    /* istanbul ignore next */
    constructor(
        readonly id:string,
        readonly label: string,
        readonly url: string
    ){}
}

export class ThirdMenu{
    /* istanbul ignore next */
    constructor(
        readonly id: string,
        readonly version: string,
        readonly label: string,
        readonly entries: ThirdMenuEntry[]){}
}

export class Process{
    /* istanbul ignore next */
    constructor(
        readonly states?:OfMap<State>
    ){}
}

export class State{
    /* istanbul ignore next */
    constructor(
        readonly details?:Detail[],
        readonly actions?:OfMap<Action>
    ){}
}

export enum ActionType {
    EXTERNAL='EXTERNAL',
    JNLP='JNLP',
    URL='URL'

}

export class Action {
    /* istanbul ignore next */
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
        readonly key?:string
    ) {}

}

export const emptyAction=new Action(null,null);

type Omit<T, K extends keyof T> = Pick<T,Exclude<keyof T,K>>;

export class ActionStatus{
    constructor(
                        readonly label: I18n,
                        readonly hidden:boolean=false,
                        readonly buttonStyle: string = '',
                        readonly contentStyle: string = '',
                        readonly inputs: Input[] = [],
                        readonly lockCard: boolean = false,
                        readonly updateState: boolean = false,
                        readonly updateStateBeforeAction: boolean = false,
                        readonly needsConfirm: boolean = false,
                        readonly lockAction: boolean = false,
    ){}
}

export const emptyActionStatus = new ActionStatus(null);

/*
for some reasons lodash equals take attribute order declaration in account to compute object equality
needed by LightCardEffects updateAThirdAction Effect and by checkIfReceivedStatusIsDifferentFromCurrentOne method of ThirdActionService .
 */
export function extractActionStatusFromPseudoActionStatus(tAction:object):ActionStatus{
    let label=new I18n('');
    const i18n = tAction['label'];
    if(i18n){
        const params = i18n['parameters'];
        if(params) {
            Object.setPrototypeOf(params,OfMap.prototype);
            label = new I18n(i18n['key'],params);
        }else{
            label = new I18n(i18n['key']);
        }

    }
    const result = new ActionStatus(
        label
        , tAction['hidden']
        ,tAction['buttonStyle']
        ,tAction['contentStyle']
        ,tAction['inputs']//TODO Need proper prototype handling
        , tAction['lockCard']
        , tAction['updateState']
        , tAction['updateStateBeforeAction']
        , tAction['needsConfirm']
        , tAction['lockAction']
    );
    return result;
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
