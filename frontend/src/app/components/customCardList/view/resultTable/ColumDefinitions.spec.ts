/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ScreenType} from '@ofServices/customScreen/ScreenDefinition';
import {getColumnsDefinitionForAgGrid} from './ColumnDefinitions';
import {CardListScreenDefinition, FieldType} from '@ofServices/customScreen/cardList/CardListScreenDefinition';

function createCardListScreenDefinition(columns: any[]): CardListScreenDefinition {
    return {
        id: 'testId',
        name: 'testName',
        type: ScreenType.CARD_LIST,
        headerFilters: [],
        processIds: [],
        results: {
            columns: columns
        }
    };
}
describe('CustomCardListView - ResultTable', () => {
    describe('Should get columns definition for ag-grid', () => {
        it('with default column definition', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'processId'
                    }
                ])
            );
            expect(columnDefs.length).toBe(1);
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('Process');
            expect(columnDefs[0].type).toBe('default');
            expect(columnDefs[0].sortable).toBeTrue();
            expect(columnDefs[0].filter).toBeTrue();
        });

        it('columnDefinition type is STRING', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'processId',
                        fieldType: FieldType.STRING,
                        flex: 2
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('Process');
            expect(columnDefs[0].type).toBe('default');
            expect(columnDefs[0].flex).toBe(2);
        });

        it('when columnDefinition type is DATE_AND_TIME ', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Start Date',
                        cardField: 'startDate',
                        fieldType: FieldType.DATE_AND_TIME
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('Start Date');
            expect(columnDefs[0].type).toBe('dateAndTime');
        });

        it('when columnDefinition type is HTML', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'HTML',
                        cardField: 'htmlField',
                        fieldType: FieldType.HTML
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('HTML');
            expect(columnDefs[0].type).toBe('html');
        });

        it('when columnDefinition type is coloredCircle', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Circle',
                        cardField: 'circleField',
                        fieldType: FieldType.COLORED_CIRCLE
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('Circle');
            expect(columnDefs[0].type).toBe('coloredCircle');
        });

        it('when columnDefinition type is BUSINESS_PERIOD', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Business Period',
                        cardField: 'businessPeriod',
                        fieldType: FieldType.BUSINESS_PERIOD
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('testField');
            expect(columnDefs[0].headerName).toBe('Business Period');
            expect(columnDefs[0].type).toBe('period');
            expect(columnDefs[0].autoHeight).toBeTrue(); // the business period is displayed on two lines
            expect(columnDefs[0].wrapText).toBeTrue();
        });

        it('when columnDefinition type is SEVERITY', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'severity',
                        cardField: 'processId',
                        fieldType: FieldType.SEVERITY
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('severity');
            expect(columnDefs[0].headerName).toBe('');
            expect(columnDefs[0].type).toBe('severity');
            expect(columnDefs[0].filter).toBeFalse();
        });

        it('when columnDefinition type is TYPE_OF_STATE', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE
                    }
                ])
            );
            expect(columnDefs[0].field).toBe('typeOfState');
            expect(columnDefs[0].headerName).toBe('Status');
            expect(columnDefs[0].type).toBe('typeOfState');
        });

        it('when columnDefinition showTooltips is set to true', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'test',
                        headerName: 'Status',
                        fieldType: FieldType.STRING,
                        showTooltips: true
                    }
                ])
            );
            expect(columnDefs[0].tooltipValueGetter).toBeDefined();
        });

        it('when minWidth is defined in column definition', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'processId',
                        fieldType: FieldType.STRING,
                        minWidth: 200
                    },
                    {
                        field: 'testField2',
                        headerName: 'test2',
                        fieldType: FieldType.STRING,
                        cardField: 'test2'
                    }
                ])
            );
            expect(columnDefs[0].minWidth).toBe(200);
            expect(columnDefs[1].minWidth).toBeUndefined();
        });

        it('when columnDefinition with multiLineText to true then autoHeight and wrapText are true', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE,
                        multiLinesInCell: true
                    }
                ])
            );
            expect(columnDefs[0].autoHeight).toBeTrue();
            expect(columnDefs[0].wrapText).toBeTrue();
        });

        it('when columnDefinition maxInputLength is set when maxInputLength is set', () => {
            const columnDefs = getColumnsDefinitionForAgGrid(
                createCardListScreenDefinition([
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE,
                        maxInputLength: 200
                    }
                ])
            );
            expect(columnDefs[0].context.maxInputLength).toBe(200);
        });
    });
});
