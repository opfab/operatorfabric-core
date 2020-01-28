/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


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
