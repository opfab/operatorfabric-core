/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {RoleEnum} from './RoleEnum';

export class Entity {
    public constructor(
        readonly id: string,
        readonly name: string,
        readonly description?: string,
        readonly roles?: RoleEnum[],
        readonly labels?: string[],
        readonly parents?: string[]
    ) {}
}
