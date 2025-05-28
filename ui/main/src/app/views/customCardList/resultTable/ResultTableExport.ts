/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/**
 * This class prepares data for export based on the data array displayed in the UI (referred to as input data).
 * The resulting array can be used to export data in CSV or Excel format.
 *
 * The only public method is getDataForExport, which returns an array of objects,
 * where each object represents a row in the table. Each row object uses the column label as the field name.
 *
 * The export process performs the following steps:
 *  - Excludes the responseFromMyEntities status field.
 *  - Extracts the numerical value for colored circle fields.
 *  - For input data containing a response field:
 *     - Adds a field listing entities that have responded.
 *     - Adds a field listing entities that have not responded.
 *     - If responseSeverityColumnLabelsForExportFile is defined in customScreenDefinition, for each severity,
 *       adds a field listing entities whose response matches the severity.
 *       The field name depends on the severity and the mapping defined in responseSeverityColumnLabelsForExportFile.
 *       Since the input data contains only color (for UI purposes) and not severity,
 *       a mapping from color to severity is required.
 */

import {CustomScreenDefinition} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {TranslationService} from '@ofServices/translation/TranslationService';

export class ResultTableExport {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly agGridColumnsDefinition: any[];

    private readonly NOT_ANSWERED = TranslationService.getTranslation('customCardList.notAnswered');
    private readonly ANSWER = TranslationService.getTranslation('customCardList.answer');

    private readonly colorToSeverity = {
        red: 'ALARM',
        orange: 'ACTION',
        green: 'COMPLIANT',
        blue: 'INFORMATION'
    };

    constructor(customScreenDefinition: CustomScreenDefinition, agGridColumnsDefinition: any[]) {
        this.customScreenDefinition = customScreenDefinition;
        this.agGridColumnsDefinition = agGridColumnsDefinition;
    }

    public getDataForExport(inputData: any[]): Array<any> {
        return inputData.map((line) => {
            const row = {};
            this.agGridColumnsDefinition.forEach((column) => {
                if (column.type !== 'responseFromMyEntities') {
                    let cellValue = line[column.field];
                    switch (column.type) {
                        case 'responses':
                            this.addResponseFieldsToRow(column.headerName, cellValue, row);
                            break;
                        case 'coloredCircle':
                            cellValue = cellValue?.numericalValue;
                            row[column.headerName] = cellValue;
                            break;
                        default:
                            if (cellValue?.text) cellValue = cellValue.text;
                            row[column.headerName] = cellValue;
                    }
                }
            });
            return row;
        });
    }

    private addResponseFieldsToRow(
        responseFieldName: string,
        responses: {color: string; entityName: string}[],
        row: {}
    ) {
        const responseColumnLabels = this.customScreenDefinition.responseSeverityColumnLabelsForExportFile;
        const respondedByType = {};
        const responded = [];
        const notResponded = [];
        if (responseColumnLabels) {
            Object.keys(responseColumnLabels).forEach((severity) => {
                respondedByType[severity] = [];
            });
        }
        responses?.forEach((response) => {
            if (response.color === 'grey') {
                // If the response is grey, it means that the entity has not responded
                notResponded.push(response.entityName);
            } else {
                responded.push(response.entityName);
                const severity = this.colorToSeverity[response.color];
                if (severity && responseColumnLabels?.[severity]) {
                    respondedByType[severity].push(response.entityName);
                }
            }
        });
        row[responseFieldName] = this.getEntityListAsString(responded);
        row[this.NOT_ANSWERED] = this.getEntityListAsString(notResponded);

        if (responseColumnLabels) {
            Object.keys(respondedByType).forEach((severity) => {
                const severityLabel = this.ANSWER + ':' + responseColumnLabels[severity];
                if (respondedByType[severity]) {
                    row[severityLabel] = this.getEntityListAsString(respondedByType[severity]);
                }
            });
        }
    }
    private getEntityListAsString(entities: string[]) {
        entities.sort((a, b) => a?.localeCompare(b));
        return entities.join(', ');
    }
}
