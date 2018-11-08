export interface LightCard {
    readonly uid: string;
    readonly id: string;
    readonly mainRecipient: string;
    readonly startDate: number;
    readonly endDate: number;
    readonly severity: Severity;
    readonly processId?: string;
    readonly lttd?: number;
    readonly title?: I18nData;
    readonly summary?: I18nData;
    // media?: string;
    // tags?: string[];

}

export class LightCard implements LightCard {

    constructor(
        readonly uid: string
        , readonly id: string
        , readonly startDate: number
        , readonly endDate: number
        , readonly severity: Severity
        , readonly mainRecipient: string

        , readonly processId?: string
        , readonly lttd?: number
        , readonly title?: I18nData
        , readonly summary?: I18nData
        // , media?: string
        // , tags?: string[]
    ) {}
}

export enum Severity {
    ALARM, ACTION, NOTIFICATION, QUESTION

}

export enum Sound {
    NOTIFICATION, QUESTION
}

export interface I18nData {
   readonly key: string;
   readonly parameters: string[];
}

export class I18nData implements I18nData{

    constructor(readonly key: string, readonly parameters: string[]) {
    }
}
