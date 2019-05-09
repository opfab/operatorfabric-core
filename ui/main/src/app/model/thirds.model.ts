import {Card, Detail} from "@ofModel/card.model";
import {I18n} from "@ofModel/i18n.model";

export class Third{
    constructor(
        readonly name:string,
        readonly version:string,
        readonly i18nLabelKey: string,
        readonly templates?:string[],
        readonly csses?:string[],
        readonly locales?:string[],
        readonly menuEntries?:ThirdMenuEntry[],
        readonly processes?:Map<string,Process>
    ){}

    extractState(card:Card):State{
        if(card.process && this.processes.has(card.process)) {
            const process = this.processes.get(card.process);
            if(card.state && process.states.has(card.state)) {
               return process.states.get(card.state);
            }
        }
        return null;
    }
}

export class ThirdMenuEntry{
    constructor(
        readonly id:string,
        readonly label: string,
        readonly url: string
    ){}
}

export class ThirdMenu{
    constructor(
        readonly id: string,
        readonly version: string,
        readonly label: string,
        readonly entries: ThirdMenuEntry[]){}
}

export class Process{
    constructor(
        readonly states?:Map<string,State>
    ){}
}

export class State{
    constructor(
        readonly details?:Detail[],
        readonly actions?:Map<string,Action>
    ){}
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