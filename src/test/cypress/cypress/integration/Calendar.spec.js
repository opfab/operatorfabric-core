/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ScriptCommands} from "../support/scriptCommands";

describe('Calendar screen tests', function () {
    
    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    
    const SECONDS = 1000;
    const HOURS = 3600000;

    before('Set up configuration', function () {
        script.deleteAllSettings();
        script.loadTestConf();
        script.deleteAllCards();
    });

    it('Check calendar screen', function () {
        const currentDate = new Date(2022, 3, 22, 12, 10);
        opfab.loginWithClock(currentDate);

        // Send card data quality
        script.sendCard(
            'cypress/calendar/chart_customDates.json',
            currentDate.getTime() + 2 * HOURS,
            currentDate.getTime() + 5 * HOURS
        );
        cy.waitDefaultTime();
        cy.tick(1 * SECONDS);
        cy.get('of-light-card').should('have.length', 1);

        cy.get('#opfab-navbarContent').find('#opfab-calendar-menu').click();
        cy.tick(1 * SECONDS);

        // test month view (view by default)
        cy.get('.opfab-calendar-event').should('have.length', 1); // only one card should be present
        openAndCheckCardDataQuality();

        // test week view
        cy.get('button')
            .contains(/^week$/)
            .should('be.visible')
            .click({force: true});
        cy.get('.opfab-calendar-event').should('have.length', 1); // only one card should be present
        openAndCheckCardDataQuality();

        // test day view
        cy.get('button').contains(/^day$/).should('be.visible').click({force: true});
        cy.get('.opfab-calendar-event').should('have.length', 1); // only one card should be present
        openAndCheckCardDataQuality();
    });


    function openAndCheckCardDataQuality() {
        cy.waitDefaultTime();
        // click the card
        cy.get('.fc-event-title').contains('Data quality').should('exist').click({force: true});

        // detail card is present, check content and then close the card
        cy.get('of-detail').should('be.visible');
        cy.get('#opfab-card-title').should('have.text', 'Data quality'.toUpperCase());
        cy.get('#opfab-div-card-template-processed')
            .find('p')
            .first()
            .should('contain.text', 'Info on quality degradation of the main server');
        cy.get('#opfab-close-card').click({force: true});
    }
});
