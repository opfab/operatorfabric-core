/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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