/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Inject} from "@angular/core";
import {Guid} from "guid-typescript";

@Inject({
    providedIn: 'root'
})
export class GuidService {

    private readonly guid: Guid;

    constructor() {
        this.guid = Guid.create();
    }

    getCurrentGuid(): Guid {
        return this.guid;
    }

    getCurrentGuidString():string{
        return this.getCurrentGuid().toString();
    }
}
