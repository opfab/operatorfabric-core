/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';

export class CustomScreenDefinition {
    id: string;
    name: string;
    cardProcessIds: string[];
    headerFilters: HeaderFilter[];
    results: {
        columns: Column[];
    };
}

export class Column {
    field?: string;
    headerName?: string;
    cardField?: string;
    fieldType: FieldType;
    flex?: number;
    getValue?: (card: Card) => string;
}

export enum FieldType {
    STRING = 'STRING',
    DATE_AND_TIME = 'DATE_AND_TIME',
    ARRAY = 'ARRAY',
    SEVERITY = 'SEVERITY',
    PUBLISHER = 'PUBLISHER',
    TYPE_OF_STATE = 'TYPE_OF_STATE',
    RESPONSES = 'RESPONSES',
    COLORED_CIRCLE = 'COLORED_CIRCLE',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES'
}

export enum HeaderFilter {
    PROCESS = 'PROCESS',
    TYPE_OF_STATE = 'TYPE_OF_STATE',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES'
}
