/* Copyright (c) 2023, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands";
import {ScriptCommands} from "../support/scriptCommands";

describe('Entity acknowledgment tests for icon in light-card', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllSettings();
        script.loadTestConf();
        
    });

    beforeEach('Delete all cards', function () {
        script.deleteAllCards();
    });

    it('Check if dashboard works correctly', function () {

        opfab.loginWithUser('operator1_fr');

        opfab.navigateToDashboard();

        const currentDate = new Date(); 

        // There are 36 grey bubbles on the dashboard because there are 36 empty states in testconf
        cy.get('of-dashboard').find("ellipse").should('have.length',36)

        // Send 1 card and check the bubble
        script.sendCard('cypress/feed/customEvent.json');
        cy.get('#opfab-dashboardCircle-kitchenSink0').should('exist');
        checkNthCircleContains("kitchenSink",0,"1");

        // The popover should show 1 card
        hoverNthCircle("kitchenSink",0);
        cy.get(".popover-body").find('button').should("have.length", 1);
        cy.get("#opfab-div-card-template-processed").should("not.exist");

        // Clicking the bubble with a single card should display said card
        clickNthCircle("kitchenSink",0);
        cy.get("#opfab-div-card-template-processed").should("exist");
        checkDisplayedCardTitle("State to test template rendering features");
        
        // Closing the card
        cy.get("#opfab-close-card").click();
        cy.get('of-card').should('not.exist');

        script.sendCard('cypress/feed/customAlarm.json');
        script.sendCard('cypress/feed/futureEvent.json');

        // There are 36 bubbles on the dashboard (35 states with 1 grey bubble and 1 state with 2 bubbles)
        cy.get('of-dashboard').find("ellipse").should('have.length',37)
        checkNthCircleContains("kitchenSink",1,"2");
        checkNthCircleContains("kitchenSink",0,"1");

        // Clicking on a circle with several cards should not display a card
        clickNthCircle("kitchenSink",1);
        cy.get("#opfab-div-card-template-processed").should("not.exist");

        // The 2 cards indicated by the bubble appear in the popover
        hoverNthCircle("kitchenSink",1);
        cy.get(".popover-body").find('button').should("have.length", 2);

        // When the time line is set to next year, there should only be grey bubbles
        setTimeLineDomain('Y')
        moveLeft()
        cy.get('of-dashboard').find("ellipse").should('have.length',36)
        checkNthCircleContains("kitchenSink",0,"0");

    });
});

function checkNthCircleContains(state,nb,value) {
    cy.get('#opfab-dashboardCircle-'+state+nb).within(() => {
        cy.get("text").contains(value);
    })  
} 

function hoverNthCircle(state,nb) {
    cy.get('#opfab-dashboardCircle-'+state+nb).trigger('mouseenter');
}

function clickNthCircle(state,nb) {
    cy.get('#opfab-dashboardCircle-'+state+nb).click();
}

function checkDisplayedCardTitle(title) {
    cy.get("#opfab-card-title").should("have.text", title.toUpperCase());
}

function setTimeLineDomain(domain) {
    // Forcing the click because the scrolling is anchored to the bottom of the page, hiding the timeline.
    cy.get('#opfab-timeline-link-period-' + domain).click({force: true});
}

function moveLeft() {
    cy.get("#timeline-left-arrow").click({force: true});
}