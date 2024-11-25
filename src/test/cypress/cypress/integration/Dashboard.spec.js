/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands";
import {ScriptCommands} from "../support/scriptCommands";
import {FeedCommands} from '../support/feedCommands'

describe('Entity acknowledgment tests for icon in light-card', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const feed = new FeedCommands();

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

        // There are 35 grey bubbles on the dashboard because there are 35 empty states in testconf
        cy.get('of-dashboard').find("ellipse").should('have.length', 35)

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
        cy.get('of-dashboard').find("ellipse").should('have.length', 36)
        checkNthCircleContains("kitchenSink", 1, "2");
        checkNthCircleContains("kitchenSink", 0, "1");

        // Clicking on a circle with several cards should not display a card
        clickNthCircle("kitchenSink",1);
        cy.get("#opfab-div-card-template-processed").should("not.exist");

        // The 2 cards indicated by the bubble appear in the popover
        hoverNthCircle("kitchenSink",1);
        cy.get(".popover-body").find('button').should("have.length", 2);

        // When the time line is set to next year, there should only be grey bubbles
        setTimeLineDomain('Y')
        moveLeft()
        cy.get('of-dashboard').find("ellipse").should('have.length', 35)
        checkNthCircleContains("kitchenSink", 0, "0");

    });

    it('Check redirection to filtered Feed page or business menu', function () {

        opfab.loginWithUser('operator1_fr');
    
        opfab.navigateToDashboard();
        
        script.sendCard('defaultProcess/message.json');
        script.sendCard('defaultProcess/process.json');

        // Check click on process, should redirect to feed with active filter and 2 cards
        cy.get('.opfab-dashboard-process').eq(4).contains('Process example');
        cy.get('.opfab-dashboard-process').eq(4).find('.opfab-feed-link').eq(0).contains('Process example').click();
        // Check if URL changes to feed with filters query parameter
        cy.url().should('include', 'feed?processFilter=defaultProcess');
        cy.url().should('not.include', 'stateFilter=');
        feed.checkFilterIsActive();
        feed.checkNumberOfDisplayedCardsIs(2);
        feed.openFirstCard();
        cy.get('#opfab-card-title').contains('PROCESS STATE (CALCUL)');

        opfab.navigateToDashboard();
        
        // Click on state with 1 card
        cy.get('.opfab-dashboard-process').eq(4).find('.opfab-feed-link').eq(5).contains('Message').click();
        cy.url().should('include', 'feed?processFilter=defaultProcess&stateFilter=messageState');
        feed.checkFilterIsActive();
        feed.checkNumberOfDisplayedCardsIs(1);
        feed.openFirstCard();
        cy.get('#opfab-card-title').contains('MESSAGE');
        opfab.navigateToDashboard();
        
        // Click on state with no cards
        cy.get('.opfab-dashboard-process').eq(4).find('.opfab-feed-link').eq(3).contains('Data quality').click();
        cy.url().should('include', 'feed?processFilter=defaultProcess&stateFilter=dataQualityState');
        feed.checkFilterIsActive();
        feed.checkNumberOfDisplayedCardsIs(0);
        opfab.navigateToDashboard();

        // Click on process with no cards
        cy.get('.opfab-dashboard-process').eq(8).contains('Test process for cypress').click();
        cy.url().should('include', 'feed?processFilter=cypress');
        feed.checkFilterIsActive();
        feed.checkNumberOfDisplayedCardsIs(0);
        opfab.navigateToDashboard();

        // Click on state which should redirect to a business menu
        cy.get('.opfab-dashboard-process').eq(4).find('.opfab-feed-link').eq(4).contains('Electricity consumption forecast').click();
        cy.url().should('include', '#businessconfigparty/uid_test_0/');
        feed.checkNumberOfDisplayedCardsIs(0);
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