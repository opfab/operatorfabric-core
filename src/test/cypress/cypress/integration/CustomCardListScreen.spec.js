/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/* This test file focuses on some state-type specific behaviour in card details header. As the Cypress test suite grows,
it might make sense to merge it with other tests.
* */
import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {ScriptCommands} from '../support/scriptCommands';
import {AgGridCommands} from '../support/agGridCommands';
import {FeedCommands} from '../support/feedCommands';

describe('Custom Card List Screen', function () {
    const feed = new FeedCommands();
    const script = new ScriptCommands();
    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllSettings();
        script.loadTestConf();
        script.deleteAllCards();
        script.deleteAllArchivedCards();
        script.send6TestCards();
    });

    describe('Custom screen 1', function () {
        it(`Check filters`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToCustomScreen1();

            cy.get('#opfab-custom-screen-table').find('#opfab-custom-screen-table-grid').should('exist');

            agGrid.countTableRows('#opfab-custom-screen-table-grid', 6);
            cy.get('.ag-header-cell').should('be.visible').should('have.length', 11);

            // Filter on "External recipient" process
            cy.get('#opfab-process').click();
            cy.get('#opfab-process').contains('External recipient').should('exist');
            cy.get('#opfab-process').find('.vscomp-option-text').eq(1).click();

            // Should have 0 card
            agGrid.countTableRows('#opfab-custom-screen-table-grid', 0);

            // Reset displayed cards
            cy.get('#opfab-monitoring-btn-reset').should('exist');
            cy.get('#opfab-monitoring-btn-reset').click();

            // Should be back to 6 cards
            agGrid.countTableRows('#opfab-custom-screen-table-grid', 6);

            // Filter on "CANCELED" process status
            cy.get('#opfab-type-of-state').click();
            cy.get('#opfab-type-of-state').contains('CANCELED').should('exist');
            cy.get('#opfab-type-of-state').find('.vscomp-option-text').eq(0).click();
            // Click again to remove the dropdown menu
            cy.get('#opfab-type-of-state').click();

            // Should have 1 card
            agGrid.countTableRows('#opfab-custom-screen-table-grid', 1);
        });

        it(`Check html cells`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToCustomScreen1();

            cy.get('#opfab-custom-screen-table').find('#opfab-custom-screen-table-grid').should('exist');

            cy.get('.ag-row[row-id="4"]')
                .should('exist')
                .within(() => {
                    // Check that 'chart line' is contained inside <i> </i>
                    cy.get('of-html-renderer').find('i').should('contain', 'chart line');
                });
        });
    });
    describe('Custom screen 2', function () {
        it(`Check response from table`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToCustomScreen2();

            cy.get('#opfab-custom-screen-table').find('#opfab-custom-screen-table-grid').should('exist');
            agGrid.countTableRows('#opfab-custom-screen-table-grid', 6);
            cy.get('.ag-header-cell').should('be.visible').should('have.length', 7);

            // Click the ag-selection-checkbox within the row and fill the answer
            cy.get('.ag-row[row-id="3"]')
                .should('exist')
                .within(() => {
                    cy.get('.ag-selection-checkbox').click();
                    cy.get('.ag-cell[col-id="comment"]').click();
                    cy.get('.ag-cell[col-id="comment"]').type('not available');
                });

            // Refuse proposal
            cy.get('#opfab-response-button-button2').click();

            // Check the answer appears in the card feed
            opfab.navigateToFeed();
            feed.openNthCard(2);
            cy.get('#opfab-div-card-template-processed').should('contain.text', 'not available');
        });
    });
});
