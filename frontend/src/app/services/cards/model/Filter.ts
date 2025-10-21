/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Filter {
    public constructor(
        readonly columnName?: string,
        readonly filterType?: string,
        readonly matchType?: FilterMatchTypeEnum,
        readonly filter?: string[],
        readonly operation?: FilterOperationTypeEnum
    ) {}
}

export enum FilterOperationTypeEnum {
    OR = 'OR',
    AND = 'AND'
}

export enum FilterMatchTypeEnum {
    BLANK,
    CONTAINS,
    ENDSWITH,
    EQUALS,
    GREATERTHAN,
    IN,
    LESSTHAN,
    NOTBLANK,
    NOTCONTAINS,
    NOTEQUAL,
    STARTSWITH
}
