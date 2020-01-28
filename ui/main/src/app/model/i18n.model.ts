
import {Map} from "@ofModel/map";

export class I18n {
    /* istanbul ignore next */
    constructor(
        readonly key: string,
        readonly parameters?: Map<string>) {
    }
}
