

import {I18n} from "@ofModel/i18n.model";

export class Message {

    /* istanbul ignore next */
    constructor(
        readonly message: string,
        readonly level = MessageLevel.DEBUG,
        readonly i18n?: I18n,
    ){}
}

export enum MessageLevel {
    ERROR, INFO, DEBUG
}
