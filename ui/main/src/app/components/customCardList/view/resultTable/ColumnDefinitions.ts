/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Column, CustomScreenDefinition, FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {Utilities} from 'app/utils/Utilities';

// See AgGrid documentation for column definitions
export type AgGridColDef = {
    autoHeight?: boolean;
    cellClassRules?: any;
    cellRenderer?: string | Function;
    cellStyle?: any;
    comparator?: Function;
    // context is used to pass custom parameters (not defined by ag-Grid)
    context?: {
        maxInputLength?: number; // max input length for select input
    };
    field: string;
    filter?: boolean | string;
    filterValueGetter?: Function;
    flex?: number;
    headerClass?: string;
    headerName: string;
    maxWidth?: number;
    minWidth?: number;
    sortable?: boolean;
    tooltipValueGetter?: Function;
    type: string;
    width?: number;
    wrapText?: boolean;
};

export function getColumnsDefinitionForAgGrid(customScreenDefinition: CustomScreenDefinition): AgGridColDef[] {
    const agGridColumns: AgGridColDef[] = [];
    if (customScreenDefinition) {
        for (const column of customScreenDefinition.results.columns) {
            const col: AgGridColDef = getDefaultColumnDefinition(column);

            switch (column.fieldType) {
                case FieldType.ACKNOWLEDGMENT:
                    setColumnForAcknowledgment(col);
                    break;
                case FieldType.BUSINESS_PERIOD:
                    setColumnForBusinessPeriod(col);
                    break;
                case FieldType.COLORED_CIRCLE:
                    setColumnForColoredCircle(col);
                    break;
                case FieldType.DATE_AND_TIME:
                    setColumnForDateAndTime(col);
                    break;
                case FieldType.HTML:
                    setColumnForHtml(col);
                    break;
                case FieldType.INPUT:
                    setColumnForInput(col);
                    break;
                case FieldType.NUMBER:
                    col.type = 'number';
                    break;
                case FieldType.NUMBER_ARRAY:
                    setColumnForNumberArray(col);
                    break;
                case FieldType.RESPONSE_FROM_MY_ENTITIES:
                    setColumnResponseFromMyEntities(col);
                    break;
                case FieldType.RESPONSES:
                    setColumnForResponses(col);
                    break;
                case FieldType.SELECT:
                    setColumnForSelect(col);
                    break;
                case FieldType.SEVERITY:
                    setColumnForSeverity(col);
                    break;
                case FieldType.TYPE_OF_STATE:
                    setColumnForTypeOfState(col);
                    break;
                default:
                    break;
            }
            agGridColumns.push(col);
        }
    }
    return agGridColumns;
}
function getDefaultColumnDefinition(column: Column): AgGridColDef {
    const col: AgGridColDef = {
        field: column.field,
        headerName: column.headerName,
        type: 'default',
        sortable: true,
        filter: true,
        wrapText: false,
        context: {},
        comparator: (valueA: any, valueB: any) => {
            return Utilities.compareObj(valueA, valueB);
        }
    };
    if (column.minWidth) {
        col.minWidth = column.minWidth;
    }
    if (column.flex) {
        col.flex = column.flex;
    }
    if (column.showTooltips) {
        col.tooltipValueGetter = (params: any) => params.value;
    }
    if (column.maxInputLength) {
        col.context.maxInputLength = column.maxInputLength;
    }
    if (column.multiLinesInCell) {
        col['autoHeight'] = true;
        col.wrapText = true;
    }
    return col;
}

function setColumnForAcknowledgment(col: AgGridColDef) {
    col.field = 'hasBeenAcknowledged';
    col.headerName = '';
    col.type = 'acknowledgment';
    col.sortable = false;
    col.filter = false;
    col.width = 15;
    col.cellRenderer = 'acknowledgmentCellRenderer';
}

function setColumnForBusinessPeriod(col: AgGridColDef) {
    col.type = 'period';
    // Period is displayed on two lines in the cell
    col.autoHeight = true;
    col.wrapText = true;
    col.cellRenderer = 'htmlCellRenderer';
    col.comparator = (valueA: any, valueB: any) => {
        // First compare startDate
        if (valueA.value.startDate < valueB.value.startDate) {
            return -1;
        }
        if (valueA.value.startDate > valueB.value.startDate) {
            return 1;
        }
        // If startDate are equal, compare endDate
        if (valueA.value.endDate < valueB.value.endDate) {
            return -1;
        }
        if (valueA.value.endDate > valueB.value.endDate) {
            return 1;
        }

        return 0;
    };

    col.filterValueGetter = stringFilterValueGetter;
}

// The cell should show a circle with the color defined in the field color,
// and the numerical value defined in the field value is used for sorting and filtering
// the use of agNumberColumnFilter is necessary to be able to filter the numerical value
// using, for example, the range filter
function setColumnForColoredCircle(col: AgGridColDef) {
    col.type = 'coloredCircle';
    col.filter = 'agNumberColumnFilter';
    col.cellStyle = {display: 'flex', 'justify-content': 'center'};
    col.cellRenderer = (params: any) => {
        return (
            '<div style="margin-top:10px;width: 20px; height: 20px;border-radius: 50%;background-color:' +
            params.value?.color +
            '"></div>'
        );
    };
    col.comparator = valueComparator;
    col.filterValueGetter = defaultFilterValueGetter;
}

function setColumnForDateAndTime(col: AgGridColDef) {
    col.type = 'dateAndTime';
    col.cellRenderer = stringCellRender;
    col.comparator = valueComparator;
    col.filterValueGetter = stringFilterValueGetter;
}

function setColumnForHtml(col: AgGridColDef) {
    col.type = 'html';
    col.cellRenderer = 'htmlCellRenderer';
    col.comparator = (valueA: any, valueB: any) => {
        const rowValueA = valueA.value ?? '';
        const rowValueB = valueB.value ?? '';
        return Utilities.compareObj(rowValueA, rowValueB);
    };
    col.filterValueGetter = defaultFilterValueGetter;
}

function setColumnForInput(col: AgGridColDef) {
    col.type = 'input';
    col.sortable = false;
    col.filter = false;
    col.cellRenderer = 'inputCellRenderer';
}

function setColumnForNumberArray(col: AgGridColDef) {
    col.type = 'numberArray';
    col.filter = true;
    col.autoHeight = true;
    col.wrapText = true;
    col.cellRenderer = 'htmlCellRenderer';
    col.filterValueGetter = (params: any) => {
        const v = params.data[params.column.colId]?.value;
        return Array.isArray(v) ? v.join(' ') : '';
    };
    col.comparator = (valueA: any, valueB: any): number => {
        // order the arrays, compare the first numbers and the following if equal
        const arrayA = valueA.value ?? [];
        const arrayB = valueB.value ?? [];
        const len = Math.min(arrayA.length, arrayB.length);
        for (let i = 0; i < len; i++) {
            if (arrayA[i] < arrayB[i]) {
                return -1;
            }
            if (arrayA[i] > arrayB[i]) {
                return 1;
            }
        }
        // If all compared numbers are equal, the shorter array is considered smaller
        if (arrayA.length < arrayB.length) {
            return -1;
        }
        if (arrayA.length > arrayB.length) {
            return 1;
        }
        return 0;
    };
}

function setColumnResponseFromMyEntities(col: AgGridColDef) {
    col.field = 'responseFromMyEntities';
    col.headerName = '';
    col.type = 'responseFromMyEntities';
    col.sortable = false;
    col.filter = false;
    col.width = 15;
    col.cellRenderer = 'hasResponseCellRenderer';
}

function setColumnForResponses(col: AgGridColDef) {
    col.field = 'responses';
    col.type = 'responses';
    col.cellRenderer = 'responsesCellRenderer';
    col.comparator = (valueA: any, valueB: any) => {
        const responseA = valueA.value.map((response) => response.entityName).join(' ');
        const responseB = valueB.value.map((response) => response.entityName).join(' ');
        if (responseA < responseB) {
            return -1;
        }
        if (responseA > responseB) {
            return 1;
        }
        return 0;
    };
    col.filterValueGetter = (params: any) => {
        return params.data[params.column.colId].value.map((response) => response.entityName).join(' ');
    };
}

function setColumnForSelect(col: AgGridColDef) {
    col.type = 'input';
    col.sortable = false;
    col.filter = false;
    col.cellRenderer = 'selectCellRenderer';

    // If there is a tooltip, i.e., tooltipValueGetter is defined, we need to override it
    // because for select fields, the tooltip should display the label of the selected option,
    // or the value if no label is defined or if the selected value is not among the possible values.
    if (col.tooltipValueGetter)
        col.tooltipValueGetter = (params: any) => {
            const tooltipText =
                params.value?.possibleValues?.find((value: any) => value.value === params.value?.value)?.label ?? // find selected value label
                params.value?.value;
            return tooltipText;
        };
}

const severitySortValue = new Map([
    ['ALARM', 1],
    ['ACTION', 2],
    ['COMPLIANT', 3],
    ['INFORMATION', 4]
]);
function setColumnForSeverity(col: AgGridColDef) {
    col.headerName = '';
    col.type = 'severity';
    col.filter = false;
    col.maxWidth = 18;
    col.cellClassRules = {
        'opfab-sev-alarm': (field) => field.value === 'ALARM',
        'opfab-sev-action': (field) => field.value === 'ACTION',
        'opfab-sev-compliant': (field) => field.value === 'COMPLIANT',
        'opfab-sev-information': (field) => field.value === 'INFORMATION'
    };
    col.headerClass = 'opfab-ag-header-with-no-padding';
    col.comparator = (valueA: any, valueB: any) => {
        valueA = severitySortValue.get(valueA);
        valueB = severitySortValue.get(valueB);
        if (valueA > valueB) {
            return 1;
        }
        if (valueA < valueB) {
            return -1;
        }
        return 0;
    };
}

function setColumnForTypeOfState(col: AgGridColDef) {
    col.field = 'typeOfState';
    col.type = 'typeOfState';
    col.cellRenderer = stringCellRender;
    col.cellStyle = (params) => {
        return {
            color: 'var(--opfab-color-' + params.value.color + ')'
        };
    };
    col.comparator = (valueA: any, valueB: any) => {
        if (valueA.stringValue < valueB.stringValue) {
            return -1;
        }
        if (valueA.stringValue > valueB.stringValue) {
            return 1;
        }
        return 0;
    };
    col.filterValueGetter = stringFilterValueGetter;
}

const stringCellRender = (params: any): string => params.value.stringValue;

const valueComparator = (valueA: any, valueB: any): number => {
    if (valueA.value < valueB.value) {
        return -1;
    }
    if (valueA.value > valueB.value) {
        return 1;
    }
    return 0;
};

const defaultFilterValueGetter = (params: any): any => {
    return params.data[params.column.colId]?.value ?? '';
};
const stringFilterValueGetter = (params: any): string => {
    return params.data[params.column.colId].stringValue;
};
