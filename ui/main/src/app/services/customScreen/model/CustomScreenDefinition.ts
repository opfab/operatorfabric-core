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
    processIds: string[];
    statesToExclude?: StateExclusion[];
    headerFilters: HeaderFilter[];
    results: {
        columns: Column[];
    };
    responseButtons?: ResponseButton[];
    responseOnlyAllowedForEntitiesRequiredToRespond?: boolean;
    showAcknowledgmentButton?: boolean;
    responseSeverityColumnLabelsForExportFile?: {[key: string]: string};
}

export class Column {
    field?: string;
    headerName?: string;
    cardField?: string;
    isFieldFromCurrentUserChildCard?: boolean;
    fieldType: FieldType;
    flex?: number;
    getValue?: (card: Card) => string;
    getHTMLValue?: (card: Card) => string;
    possibleValues?: {value: string; label: string}[];
    allowNewOptionForSelect?: boolean;
    minWidth?: number;
    showTooltips?: boolean;
    multiLinesInCell?: boolean;
    maxInputLength?: number;
}

export class ResponseButton {
    id: string;
    label: string;
    getUserResponses: (selectedCards: Card[], userInputs: Map<string, any>) => any;
}

export class UserResponse {
    valid: boolean;
    errorMsg: string;
    responseCards: any[];
}

export class StateExclusion {
    processId: string;
    stateIds: string[];
}

export enum FieldType {
    STRING = 'STRING',
    HTML = 'HTML',
    DATE_AND_TIME = 'DATE_AND_TIME',
    SEVERITY = 'SEVERITY',
    PUBLISHER = 'PUBLISHER',
    TYPE_OF_STATE = 'TYPE_OF_STATE',
    RESPONSES = 'RESPONSES',
    COLORED_CIRCLE = 'COLORED_CIRCLE',
    STATE_NAME = 'STATE_NAME',
    PROCESS_NAME = 'PROCESS_NAME',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES',
    ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
    INPUT = 'INPUT',
    SELECT = 'SELECT'
}

export enum HeaderFilter {
    PROCESS = 'PROCESS',
    TYPE_OF_STATE = 'TYPE_OF_STATE',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES',
    RESPONSE_FROM_ALL_ENTITIES = 'RESPONSE_FROM_ALL_ENTITIES',
    READ_ACK = 'READ_ACK'
}
