/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Guid} from 'guid-typescript';

@Injectable()
export class GuidService {

    private readonly guid: Guid;

    constructor() {
        this.guid = Guid.create();
    }

    getCurrentGuid(): Guid {
        return this.guid;
    }

    getCurrentGuidString(): string {
        return this.getCurrentGuid().toString();
    }
}
