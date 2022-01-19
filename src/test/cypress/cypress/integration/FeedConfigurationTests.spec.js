/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Feed configuration tests',function () {

    before('Set up configuration and cards', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.send6TestCards(); // The feed needs to have cards so the "Acknowledge all cards" feature can be shown
    });

    beforeEach('Reset UI configuration file ', function () {
        cy.resetUIConfigurationFiles();
    })

    /*
    it('Buttons and filters visibility - Check default behaviour', function () {

        // Default is "false" (i.e. visible) except for hideAckAllCardsFeature

        // Removing corresponding properties from the web-ui file
        cy.removePropertyInConf('feed.card.hideTimeFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideAckFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideResponseFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideReadSort','web-ui');
        cy.removePropertyInConf('feed.card.hideSeveritySort','web-ui');
        cy.removePropertyInConf('feed.card.hideAckAllCardsFeature','web-ui');

        cy.loginOpFab('operator1_fr','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-ack-filter-form');
        cy.get('#opfab-response-filter-form');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread');
        cy.get('#opfab-feed-filter-severity');

        cy.get('#opfab-feed-ack-all-link').should('not.exist');


    })

    it('Buttons and filters visibility - Set property to true', function () {

        // Setting properties to true in file
        cy.setPropertyInConf('feed.card.hideTimeFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideAckFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideReadSort','web-ui',true);
        cy.setPropertyInConf('feed.card.hideSeveritySort','web-ui',true);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',true);

        cy.loginOpFab('operator1_fr','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form').should('not.exist');
        cy.get('#opfab-ack-filter-form').should('not.exist');
        cy.get('#opfab-response-filter-form').should('not.exist');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread').should('not.exist');
        cy.get('#opfab-feed-filter-severity').should('not.exist');

        cy.get('#opfab-feed-ack-all-link').should('not.exist');

    })

    it('Buttons and filters visibility - Set property to false', function () {

        // Setting properties to true in file
        cy.setPropertyInConf('feed.card.hideTimeFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideAckFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideReadSort','web-ui',false);
        cy.setPropertyInConf('feed.card.hideSeveritySort','web-ui',false);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',false);

        cy.loginOpFab('operator1_fr','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-ack-filter-form');
        cy.get('#opfab-response-filter-form');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread');
        cy.get('#opfab-feed-filter-severity');

        cy.get('#opfab-feed-ack-all-link');

    })

    */

    it('Check if timeline is locked or unlocked for each view', function () {

        cy.loginOpFab('operator1_fr','test');

        // Checking real time view
        cy.get('#opfab-timeline-link-period-TR').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking Day view
        cy.get('#opfab-timeline-link-period-J').click();
        cy.get("#opfab-timeline-lock").should("not.exist");
        cy.get("#opfab-timeline-unlock").should("exist");

        // Checking 7 Day view
        cy.get('#opfab-timeline-link-period-7D').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking Week view
        cy.get('#opfab-timeline-link-period-W').click();
        cy.get("#opfab-timeline-lock").should("not.exist");
        cy.get("#opfab-timeline-unlock").should("exist");

         // Checking Month view
         cy.get('#opfab-timeline-link-period-M').click();
         cy.get("#opfab-timeline-lock").should("not.exist");
         cy.get("#opfab-timeline-unlock").should("exist");
 
         // Checking 7 Year view
         cy.get('#opfab-timeline-link-period-Y').click();
         cy.get("#opfab-timeline-lock").should("not.exist");
         cy.get("#opfab-timeline-unlock").should("exist");

    })    
    
    it('Check if timeline moves when unlocked in real time view', 
        { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31rst of March 2030, at 23h59
        // NB : for some reason month seems to start at 0
        cy.loginWithClock(new Date(2030, 2, 31, 23, 59));

        cy.get(".axis").find("text").first().as('firstTimelineXTick');

        cy.get('#opfab-timeline-link-period-TR').click();
        
        cy.get("@firstTimelineXTick").should("exist");
        cy.get("@firstTimelineXTick").should("have.text", " 21h ");

        // go 1 hour in the future 
        cy.tick(1*60*60*1000);
        cy.wait(250);

        // Check that the timeline moved accordingly
        cy.get("@firstTimelineXTick").should("have.text", " 22h30 ");
    })

    it('Check if timeline moves when locked in real time view',
        { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31rst of March 2030, at 23h59
        // NB : for some reason month seems to start at 0
        cy.loginWithClock(new Date(2030, 2, 31, 23, 59));
    
        cy.get(".axis").find("text").first().as('firstTimelineXTick');
    
        cy.get('#opfab-timeline-link-period-TR').click();
        cy.get("#opfab-timeline-lock").click()
        
        cy.get("@firstTimelineXTick").should("exist");
        cy.get("@firstTimelineXTick").should("have.text", " 21h ");
    
        // go 1 hour in the future 
        cy.tick(1*60*60*1000);
        cy.wait(250);
    
        // Check that the timeline moved accordingly
        cy.get("@firstTimelineXTick").should("have.text", " 21h ");
    })
    


    it('Check if timeline moves when unlocked in seven days view', 
        { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31rst of March 2030, at 23h59
        // NB : for some reason month seems to start at 0
        cy.loginWithClock(new Date(2030, 2, 31, 23, 59));

        cy.get(".axis").find("text").first().as('firstTimelineXTick');

        cy.get('#opfab-timeline-link-period-7D').click();

        cy.get("@firstTimelineXTick").should("exist");
        cy.get("@firstTimelineXTick").should("have.text", " 08h ");
        cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " Sun 31 Mar");

        // go 1 hour in the future 
        cy.tick(1*60*60*1000);
        cy.wait(250);

        // Check that the timeline did not move
        cy.get("@firstTimelineXTick").should("have.text", " 08h ");
        cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " Sun 31 Mar");


        // go 27 hours in the future 
        cy.tick(27*60*60*1000);
        cy.wait(250);

        // Check that the timeline moved accordingly
        cy.get("@firstTimelineXTick").should("have.text", " 16h ");
        cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " ");

})

it('Check if timeline moves when unlocked in seven days view', 
    { defaultCommandTimeout: 10000}, function () {

    // Logging on Sunday, 31rst of March 2030, at 23h59
    // NB : for some reason month seems to start at 0
    cy.loginWithClock(new Date(2030, 2, 31, 23, 59));

    cy.get(".axis").find("text").first().as('firstTimelineXTick');

    cy.get('#opfab-timeline-link-period-7D').click();
    cy.get("#opfab-timeline-lock").click()

    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 08h ");
    cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " Sun 31 Mar");

    // go 1 hour in the future 
    cy.tick(1*60*60*1000);
    cy.wait(250);

    // Check that the timeline did not move
    cy.get("@firstTimelineXTick").should("have.text", " 08h ");
    cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " Sun 31 Mar");


    // go 27 hours in the future 
    cy.tick(27*60*60*1000);
    cy.wait(250);

    // Check that the timeline moved accordingly
    cy.get("@firstTimelineXTick").should("have.text", " 08h ");
    cy.get(".of-custom-timeline-chart").find(".chart").find("text").first().should("have.text", " Sun 31 Mar");

})


})
