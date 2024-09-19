/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class ProcessMonitoringConfig {
    public constructor(
        readonly fields: ProcessMonitoringField[],
        readonly fieldsForProcesses: ProcessMonitoringFieldsForProcess[],
        readonly filters: ProcessMonitoringFilters
    ) {}
}

export class ProcessMonitoringField {
    constructor(
        readonly field: string,
        readonly colName: string,
        readonly type: string,
        readonly size: number
    ) {}
}

export class ProcessMonitoringFieldsForProcess {
    constructor(
        readonly process: string,
        readonly fields: ProcessMonitoringField[]
    ) {}
}

export class ProcessMonitoringFilters {
    constructor(
        readonly tags: ProcessMonitoringFilterTag[],
        readonly pageSize: number
    ) {}
}

export class ProcessMonitoringFilterTag {
    constructor(
        readonly label: string,
        readonly value: string
    ) {}
}

export enum ProcessMonitoringFieldEnum {
    STRING = 'string',
    DATE = 'date',
    ARRAY = 'array'
}
