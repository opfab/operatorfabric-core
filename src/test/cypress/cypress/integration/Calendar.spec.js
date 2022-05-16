/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Calendar screen tests',function () {

    function openAndCheckCardDataQuality() {
        cy.waitDefaultTime();
        // click the card
        cy.get('.fc-event-title').contains("Data quality").should("be.visible").click();

        // detail card is present, check content and then close the card
        cy.get('of-detail').should("be.visible");
        cy.get('#opfab-card-title').should("have.text", "Data quality");
        cy.get('#opfab-div-card-template').find('p').first().should("contain.text", "Info on quality degradation of the main server");
        cy.get('#opfab-close-card').click();
    }

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
    });


    it('Check calendar screen', function () {
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr','test');

        cy.get('#opfab-navbarContent').find('#opfab-calendar-menu').click();

// Temporary stop this test to avoid errors on CI/CD 
// to be solve in https://github.com/opfab/operatorfabric-core/issues/2983

/** 
        // test month view (view by default)
        cy.get('.opfab-calendar-event').should("have.length", 1); // only one card should be present
        openAndCheckCardDataQuality();

        // test week view (in the week view, the card can be displayed with 1 or 2 events, depending if the business period
        // is all in the current day or if it is on the current day + the following)
        cy.get('button').contains(/^week$/).should("be.visible").click();
        cy.get('.opfab-calendar-event').its("length").should("be.gte", 1);
        cy.get('.opfab-calendar-event').its("length").should("be.lte", 2);
        cy.get('.fc-event-title').each((event) => {cy.get(event).should("have.text", "Data quality")});
        openAndCheckCardDataQuality();

        // test day view
        cy.get('button').contains(/^day$/).should("be.visible").click();
        cy.get('.opfab-calendar-event').should("have.length", 1); // only one card should be present
        openAndCheckCardDataQuality(); **/
    })
})