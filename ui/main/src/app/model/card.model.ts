

import {Severity} from "@ofModel/light-card.model";
import {I18n} from "@ofModel/i18n.model";

export class Card {
    /* istanbul ignore next */
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly publisherVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
        readonly severity: Severity,
        readonly process?: string,
        readonly processId?: string,
        readonly state?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly data?: any,
        readonly details?: Detail[],
        readonly entityRecipients?: string[],
        readonly externalRecipients?: string[],
        readonly recipient?: Recipient
    ) {
    }
}

export enum TitlePosition {
    UP, DOWN, NONE

}

export class Detail {
    /* istanbul ignore next */
    constructor(
        readonly titlePosition: TitlePosition,
        readonly title: I18n,
        readonly titleStyle: string,
        readonly templateName: string,
        readonly styles: string[]) {
    }
}

export class Recipient {
    constructor(
        readonly type?: RecipientEnum,
        readonly recipients?: Recipient[],
        readonly identity?: string
    ) {}
}

export enum RecipientEnum {
    DEADEND, GROUP, UNION, USER
}