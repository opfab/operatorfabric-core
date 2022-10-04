/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class AgGridCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('AG GRID');
    }

    countTableRows = function (table, rowsNum) {
        cy.get(table).find('.ag-center-cols-container').find('.ag-row').should('have.length', rowsNum);
    }

    // Check ag-grid cell value
    cellShould = function (table, row, col, operator, value) {
        cy.get(table)
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(row)
            .find('.ag-cell-value')
            .eq(col)
            .should(operator, value);
    }

    // Check ag-grid cell value
    cellElementShould = function (table, row, col, element, operator, value) {
        cy.get(table)
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(row)
            .find('.ag-cell-value')
            .eq(col)
            .find(element)
            .should(operator, value);
    }

    // Click on ag-grid cell
    // Specific tag should be specified in case of cell renderers
    clickCell = function (table, row, col, tag) {
        if (!!tag) {
            cy.get(table)
                .find('.ag-center-cols-container')
                .find('.ag-row')
                .eq(row)
                .find('.ag-cell-value')
                .eq(col)
                .find(tag)
                .eq(0)
                .click();
        } else {
            cy.get(table).find('.ag-center-cols-container').find('.ag-row').eq(row).find('.ag-cell-value').eq(col).click();
        }
    }
}

