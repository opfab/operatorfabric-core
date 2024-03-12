/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Page<T> {
    constructor(
        readonly totalPages: number,
        readonly totalElements: number,
        readonly content: T[]
    ) {}
}

export const emptyPage: Page<any> = new Page(1, 0, []);
