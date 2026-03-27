/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {ScreenDefinition} from './ScreenDefinition';

export class CardListScreenDefinition extends ScreenDefinition {
    processIds: string[];
    statesToExclude?: StateExclusion[];
    headerFilters: HeaderFilter[];
    results: {
        columns: Column[];
    };
    responseButtons?: ResponseButton[];
    responseOnlyAllowedForEntitiesRequiredToRespond?: boolean;
    responsePossibleOnlyForProcessStates?: {process: string; states: string[]}[];
    showAcknowledgmentButton?: boolean;
    responseSeverityColumnLabelsForExportFile?: {[key: string]: string};
    defaultSelectedTypeOfState?: string[];
    defaultSelectedReadAndAck?: string[];
    includeOnlyCardsEmittedByCurrentUserEntities?: boolean;
    excludeCardsEmittedByCurrentUserEntities?: boolean;
    initialBusinessPeriod?: string;
    showBackButton?: boolean;
}

export class Column {
    field?: string;
    headerName?: string;
    cardField?: string;
    isFieldFromCurrentUserChildCard?: boolean;
    fieldType: FieldType;
    flex?: number;
    getValue?: (card: Card) => any;
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
    ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
    BUSINESS_PERIOD = 'BUSINESS_PERIOD',
    COLORED_CIRCLE = 'COLORED_CIRCLE',
    DATE_AND_TIME = 'DATE_AND_TIME',
    HTML = 'HTML',
    INPUT = 'INPUT',
    NUMBER = 'NUMBER',
    NUMBER_ARRAY = 'NUMBER_ARRAY',
    PROCESS_NAME = 'PROCESS_NAME',
    PERIOD_ARRAY = 'PERIOD_ARRAY',
    PUBLISHER = 'PUBLISHER',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES',
    RESPONSES = 'RESPONSES',
    SELECT = 'SELECT',
    SEVERITY = 'SEVERITY',
    STATE_NAME = 'STATE_NAME',
    STRING = 'STRING',
    TYPE_OF_STATE = 'TYPE_OF_STATE'
}

export enum HeaderFilter {
    PROCESS = 'PROCESS',
    TYPE_OF_STATE = 'TYPE_OF_STATE',
    RESPONSE_FROM_MY_ENTITIES = 'RESPONSE_FROM_MY_ENTITIES',
    RESPONSE_FROM_ALL_ENTITIES = 'RESPONSE_FROM_ALL_ENTITIES',
    READ_ACK = 'READ_ACK'
}
