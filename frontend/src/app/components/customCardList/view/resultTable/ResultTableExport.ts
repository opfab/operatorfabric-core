/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
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
 *     - If responseSeverityColumnLabelsForExportFile is defined in cardListScreenDefinition, for each severity,
 *       adds a field listing entities whose response matches the severity.
 *       The field name depends on the severity and the mapping defined in responseSeverityColumnLabelsForExportFile.
 *       Since the input data contains only color (for UI purposes) and not severity,
 *       a mapping from color to severity is required.
 */

import {TranslationService} from '@ofServices/translation/TranslationService';
import {CardListScreenDefinition} from '@ofServices/customScreen/model/CardListScreenDefinition';

export class ResultTableExport {
    private readonly cardListScreenDefinition: CardListScreenDefinition;
    private readonly agGridColumnsDefinition: any[];

    private readonly NOT_ANSWERED = TranslationService.getTranslation('customCardList.notAnswered');
    private readonly ANSWER = TranslationService.getTranslation('customCardList.answer');
    private readonly ACKNOWLEDGED = TranslationService.getTranslation('customCardList.acknowledged');

    private readonly colorToSeverity = {
        red: 'ALARM',
        orange: 'ACTION',
        green: 'COMPLIANT',
        blue: 'INFORMATION'
    };

    constructor(cardListScreenDefinition: CardListScreenDefinition, agGridColumnsDefinition: any[]) {
        this.cardListScreenDefinition = cardListScreenDefinition;
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
                            this.addResponseFieldsToRow(column.headerName, cellValue.value, row);
                            break;
                        case 'coloredCircle':
                        case 'html':
                            cellValue = cellValue?.value;
                            row[column.headerName] = cellValue;
                            break;
                        case 'numberArray':
                            if (Array.isArray(cellValue.value)) {
                                row[column.headerName] = cellValue.value.join(',');
                            }
                            break;
                        case 'acknowledgment':
                            row[this.ACKNOWLEDGED] = cellValue;
                            break;
                        default:
                            if (cellValue?.stringValue) {
                                cellValue = cellValue.stringValue;
                            }
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
        const responseColumnLabels = this.cardListScreenDefinition.responseSeverityColumnLabelsForExportFile;
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
