
import {Severity} from "@ofModel/light-card.model";
import {I18n} from "@ofModel/i18n.model";

export class Page<T> {
    /* istanbul ignore next */
    constructor(
        readonly totalPages: number,
        readonly totalElements: number,
        readonly content: T[]
    ) {
    }
}
