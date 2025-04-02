/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition, FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {Card} from 'app/model/Card';
import {TableRowBuilder} from './TableRowBuilder';
import {FilterValues} from '../FilterValues';
import {CardFilter} from './CardFilter';

export class ResultTable {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly tableRowsBuilder: TableRowBuilder;
    private readonly cardFilter: CardFilter;

    private results: Array<any> = [];

    constructor(customScreenDefinition: CustomScreenDefinition) {
        this.customScreenDefinition = customScreenDefinition;
        this.tableRowsBuilder = new TableRowBuilder(customScreenDefinition);
        this.cardFilter = new CardFilter();
    }

    public getColumnsDefinitionForAgGrid(): any[] {
        const agGridColumns = [];
        if (this.customScreenDefinition) {
            this.customScreenDefinition.results.columns.forEach((column) => {
                const col = {
                    field: column.field,
                    headerName: column.headerName,
                    type: 'default'
                };
                if (column.minWidth) col['minWidth'] = column.minWidth;
                if (column.flex) col['flex'] = column.flex;
                if (column.showTooltips) col['showTooltips'] = true;
                if (column.multiLinesInCell) {
                    col['autoHeight'] = true;
                    col['wrapText'] = true;
                }

                switch (column.fieldType) {
                    case FieldType.SEVERITY:
                        col.headerName = '';
                        col.type = 'severity';
                        break;
                    case FieldType.DATE_AND_TIME:
                        col.type = 'dateAndTime';
                        break;
                    case FieldType.TYPE_OF_STATE:
                        col.field = 'typeOfState';
                        col.type = 'typeOfState';
                        break;
                    case FieldType.RESPONSES:
                        col.field = 'responses';
                        col.type = 'responses';
                        break;
                    case FieldType.RESPONSE_FROM_MY_ENTITIES:
                        col.field = 'responseFromMyEntities';
                        col.headerName = '';
                        col.type = 'responseFromMyEntities';
                        break;
                    case FieldType.ACKNOWLEDGMENT:
                        col.field = 'hasBeenAcknowledged';
                        col.headerName = '';
                        col.type = 'acknowledgment';
                        break;
                    case FieldType.STATE_NAME:
                        col.type = 'stateName';
                        break;
                    case FieldType.PROCESS_NAME:
                        col.type = 'processName';
                        break;
                    case FieldType.COLORED_CIRCLE:
                        col.type = 'coloredCircle';
                        break;
                    case FieldType.INPUT:
                        col.type = 'input';
                        break;
                    case FieldType.SELECT:
                        col.type = 'select';
                        break;
                    case FieldType.HTML:
                        col.type = 'html';
                        break;
                    default:
                        break;
                }
                agGridColumns.push(col);
            });
        }
        return agGridColumns;
    }

    public setFilters(filtersValue: FilterValues) {
        this.cardFilter.setFilters(filtersValue);
    }

    public getDataArrayFromCards(cards: Card[], childCards: Map<string, Array<Card>>): any[] {
        const dataArray = [];
        cards.forEach((card) => {
            if (!this.cardFilter.isCardFiltered(card, childCards)) {
                const data = this.tableRowsBuilder.getRowFromCard(
                    card,
                    childCards.get(card.id),
                    this.customScreenDefinition.results.columns
                );
                dataArray.push(data);
            }
        });
        this.results = dataArray;
        return dataArray;
    }

    public getDataForExport(): Array<any> {
        return this.results.map((line) => {
            const row = {};
            this.getColumnsDefinitionForAgGrid().forEach((column) => {
                let cellValue = line[column.field];
                if (column.type === 'responses') {
                    cellValue = this.getResponseFieldForExport(cellValue);
                } else if (cellValue?.text) {
                    cellValue = cellValue.text;
                }
                row[column.headerName] = cellValue;
            });
            return row;
        });
    }

    private getResponseFieldForExport(cellValue: any[]): string {
        if (!cellValue?.length) return '';
        return (
            cellValue
                // exclude grey color which represents the absence of response
                .filter((response) => response.color !== 'grey')
                .map((response) => response.name)
                .join(', ')
        );
    }
}
