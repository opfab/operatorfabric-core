import {Map} from "@ofModel/map";

export class I18n {
    constructor(
        readonly key: string,
        readonly parameters: Map<string>) {
    }
}