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
import {CardCommands} from '../support/cardCommands';

describe('Custom Card List Screen', function () {
    const feed = new FeedCommands();
    const script = new ScriptCommands();
    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const card = new CardCommands();

    function charCountOnInputShouldBe(countString) {
        cy.get('.char-count').should('contain.text', countString);
    }

    function numberOfRowsShouldBe(rowNumber) {
        agGrid.countTableRows('#opfab-custom-screen-table-grid', rowNumber);
    }

    function numberOfColumsShouldBe(colNumber) {
        cy.get('.ag-header-cell').should('have.length', colNumber);
    }

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
            numberOfColumsShouldBe(11);
            numberOfRowsShouldBe(6);

            // Filter on "External recipient" process
            cy.get('#opfab-process').click();
            cy.get('#opfab-process').contains('External recipient').should('exist');
            cy.get('#opfab-process').find('.vscomp-option-text').eq(1).click();

            numberOfRowsShouldBe(0);

            // Reset displayed cards
            cy.get('#opfab-monitoring-btn-reset').click();

            numberOfRowsShouldBe(6);

            // Filter on "CANCELED" process status
            cy.get('#opfab-type-of-state').click();
            cy.get('#opfab-type-of-state').contains('CANCELED').should('exist');
            cy.get('#opfab-type-of-state').find('.vscomp-option-text').eq(0).click();
            // Click again to remove the dropdown menu
            cy.get('#opfab-type-of-state').click();

            numberOfRowsShouldBe(1);
        });

        it(`Check html cells`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToCustomScreen1();

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

            numberOfColumsShouldBe(8);
            numberOfRowsShouldBe(6);
            cy.get('#opfab-response-button-button2').should('exist').and('be.disabled');

            // Click the ag-selection-checkbox within the row and fill the answer
            cy.get('.ag-row[row-id="3"]')
                .should('exist')
                .within(() => {
                    cy.get('.ag-selection-checkbox').click();
                    cy.get('.ag-cell[col-id="comment"]').click();
                    charCountOnInputShouldBe('0/256');
                    cy.get('.ag-cell[col-id="comment"]').type('not available');
                    charCountOnInputShouldBe('13/256');
                    cy.get('#opfab-customcardlist-select').select('Constraints on the network');
                });
            cy.get('#opfab-response-button-button2').click();
            cy.get('#opfab-close-alert').click();

            // Check the answer appears in the card feed
            opfab.navigateToFeed();
            feed.openNthCard(2);
            card.checkContainsText('not available');
            card.checkContainsText('Constraints on the network');
        });
    });
    describe('Custom screen 3', function () {
        it(`Check acknowledgment`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToCustomScreen3();

            cy.get('#opfab-custom-screen-table').find('#opfab-custom-screen-table-grid').should('exist');
            agGrid.countTableRows('#opfab-custom-screen-table-grid', 6);
            cy.get('.ag-header-cell').should('be.visible').should('have.length', 8);
            cy.get('#opfab-response-button-button1').should('exist').and('be.disabled');
            cy.get('#opfab-response-button-button2').should('exist').and('be.disabled');
            cy.get('#opfab-acknowledge-button').should('exist').and('be.disabled');

            // Check no cards are acknowledged
            cy.get('.ag-root-wrapper').find('.fa-check').should('not.exist');

            //Select the card with possible answer
            cy.get('.ag-row[row-id="3"]')
                .should('exist')
                .within(() => {
                    cy.get('.ag-selection-checkbox').click();
                });
            cy.get('#opfab-response-button-button1').should('exist').and('not.be.disabled');
            cy.get('#opfab-response-button-button2').should('exist').and('not.be.disabled');
            cy.get('#opfab-acknowledge-button').should('exist').and('be.disabled');

            // Select every card and acknowledge them
            cy.get('.ag-header-select-all input[type="checkbox"]').click({multiple: true, force: true});
            cy.get('#opfab-acknowledge-button').should('exist').and('not.be.disabled');
            cy.get('#opfab-acknowledge-button').click();

            // Check the number of acknowledged icons in the column
            cy.get(`[col-id="hasBeenAcknowledged"] .fa-check`).should('have.length', 5);
        });
    });
});
