/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class MonitoringConfig {
    export : ExportConfig
    public constructor(
        readonly exportConfig: ExportConfig  // cannot use variable name export as it is a reserved word in this case 
    ) {
        this.export = exportConfig;
    }
}

export class ExportConfig {
    constructor(
        readonly fields: Array<Field>,
    ) {
    }
}

export class Field {
    constructor(
        readonly columnName: string ,
        readonly jsonField: string
    ) {
    }
}
