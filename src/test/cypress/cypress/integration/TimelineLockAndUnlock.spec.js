/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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
    });

    beforeEach('Reset UI configuration file ', function () {
        cy.resetUIConfigurationFiles();
    })


    it('Check if timeline is unlocked for each view', function () {

        cy.loginOpFab('operator1_fr','test');

        // Checking real time view
        cy.get('#opfab-timeline-link-period-TR').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking Day view
        cy.get('#opfab-timeline-link-period-J').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking 7 Day view
        cy.get('#opfab-timeline-link-period-7D').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking Week view
        cy.get('#opfab-timeline-link-period-W').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking Month view
        cy.get('#opfab-timeline-link-period-M').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

        // Checking 7 Year view
        cy.get('#opfab-timeline-link-period-Y').click();
        cy.get("#opfab-timeline-lock").should("exist");
        cy.get("#opfab-timeline-unlock").should("not.exist");

    })

    it('Check if timelime resets to current cycle when locking it, changing domain and unlocking timeline', function () {

        // Logging on Sunday, 31rst of March 2030, at 11h59
        // NB : for some reason month seems to start at 0
        cy.loginWithClock(new Date(2030, 2, 31, 11, 59));

        // Checking real time view
        cy.get('#opfab-timeline-link-period-TR').click();
        cy.get(".axis").find("text").first().as('firstTimelineXTick');

        cy.get("@firstTimelineXTick").should("have.text", " 09h30 ");
        
        cy.get("#opfab-timeline-lock").click();
        cy.get("#opfab-timeline-link-move-right").click();
        cy.get("@firstTimelineXTick").should("have.text", " 11h30 ");


        cy.get("#opfab-timeline-unlock").click();
        cy.get("@firstTimelineXTick").should("have.text", " 09h30 ");
    })


    ////////////////////////////// Test on real time view
    it('Check if timeline moves when unlocked in real time view', 
        { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31rst of March 2030, at 23h59
        // NB : for some reason month seems to start at 0
        cy.loginWithClock(new Date(2030, 2, 31, 23, 59));

        cy.get(".axis").find("text").first().as('firstTimelineXTick');

        cy.get('#opfab-timeline-link-period-TR').click();
        
        cy.get("@firstTimelineXTick").should("exist");
        cy.get("@firstTimelineXTick").should("have.text", " 21h30 ");

        // go 1 hour in the future 
        cy.tick(1*60*60*1000);
        cy.wait(500);

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
        cy.get("#opfab-timeline-lock").click();
        
        cy.get("@firstTimelineXTick").should("exist");
        cy.get("@firstTimelineXTick").should("have.text", " 21h30 ");

        // go 1 hour in the future 
        cy.tick(1*60*60*1000);
        cy.wait(250);

        // Check that the timeline moved accordingly
        cy.get("@firstTimelineXTick").should("have.text", " 21h30 ");
    })   

    ////////////////////////////// Test on seven dayw view


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

    it('Check if timeline moves when locked in seven days view', 
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

    ////////////////////////////// Test on day view


    it('Check if timeline moves when unlocked in Day view', 
    { defaultCommandTimeout: 10000}, function () {

    // Logging on Sunday, 31rst of December 2028, at 23h59
    // NB : for some reason month seems to start at 0
    cy.loginWithClock(new Date(2028, 11, 31, 23, 59));

    cy.get(".axis").find("text").first().as('firstTimelineXTick');

    cy.get('#opfab-timeline-link-period-J').click();

    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 00h ");
    cy.get("#opfab-timeline-title").should("have.text", " 31 December 2028 ");
    cy.get("#opfab-timeline-time-cursor").should("exist");
    cy.get("#opfab-timeline-time-cursor").should("have.text", " 31/12/28 23:59 ");

    // send cards
    cy.loadTestConf().send6TestCards();

    cy.tick(1000);

    // go 2 minutes in the future 
    cy.tick(2*60*1000);
    cy.wait(250);

    // Check that the timeline moved accordingly
    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 00h ");
    cy.get("#opfab-timeline-title").should("have.text", " 01 January 2029 ");
    cy.get("#opfab-timeline-time-cursor").should("exist");
    cy.get("#opfab-timeline-time-cursor").should("have.text", " 01/01/29 00:01 ");


    // go 16 hours in the future 
    cy.tick(16*60*60*1000);
    cy.wait(250);

    // Check that the timeline did not move
    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 00h ");
    cy.get("#opfab-timeline-title").should("have.text", " 01 January 2029 ");
    cy.get("#opfab-timeline-time-cursor").should("exist");
    cy.get("#opfab-timeline-time-cursor").should("have.text", " 01/01/29 16:01 ");

    })

    it('Check if timeline moves when locked in Day view', 
    { defaultCommandTimeout: 10000}, function () {

    // Logging on Sunday, 31rst of December 2028, at 23h59
    // NB : for some reason month seems to start at 0
    cy.loginWithClock(new Date(2028, 11, 31, 23, 59));

    cy.get(".axis").find("text").first().as('firstTimelineXTick');

    cy.get('#opfab-timeline-link-period-J').click();
    cy.get("#opfab-timeline-lock").click();

    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 00h ");
    cy.get("#opfab-timeline-title").should("have.text", " 31 December 2028 ");
    cy.get("#opfab-timeline-time-cursor").should("exist");
    cy.get("#opfab-timeline-time-cursor").should("have.text", " 31/12/28 23:59 ");

    // go 10 minutes in the future 
    cy.tick(10*60*1000);
    cy.wait(250);

    // Check that the timeline did not move
    cy.get("@firstTimelineXTick").should("exist");
    cy.get("@firstTimelineXTick").should("have.text", " 00h ");
    cy.get("#opfab-timeline-title").should("have.text", " 31 December 2028 ");
    cy.get("#opfab-timeline-time-cursor").should("not.exist");

    })

    it('Check the overlap in Day view when timeline shifts', 
    { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31rst of December 2028, at 23h30l
        // NB : for some reason month seems to start at 0
        const afternoonDate = new Date(2028, 11, 31, 15, 30);
        const justBeforeMidnightDate = new Date(2028, 11, 31, 23, 55);
        cy.loginWithClock(justBeforeMidnightDate);

        cy.get('#opfab-timeline-link-period-J').click();

        // send cards
        cy.sendCard('cypress/feed/customEvent.json', afternoonDate.getTime(), afternoonDate.getTime() + 5*60*1000);
        cy.wait(500);
        cy.tick(1000);
        cy.sendCard('cypress/feed/customAlarm.json', justBeforeMidnightDate.getTime(), justBeforeMidnightDate.getTime() + 5*60*1000);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1000);

        // Check the card is received
        cy.get("#opfab-timeline-title").should("have.text", " 31 December 2028 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 2);


        // go 35 minutes in the future 
        cy.tick(35*60*1000);

        // The card before midnight should be visible
        cy.get("#opfab-timeline-title").should("have.text", " 01 January 2029 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 1);
    })

    it('Check the overlap in Day view when clicking on next day', 
    { defaultCommandTimeout: 10000}, function () {

        console.log("########################## Click TU")

        // Logging on Sunday, 31rst of December 2028, at 23h30l
        // NB : for some reason month seems to start at 0
        const afternoonDate = new Date(2028, 11, 31, 15, 30);
        const justBeforeMidnightDate = new Date(2028, 11, 31, 23, 55);
        cy.loginWithClock(justBeforeMidnightDate);

        cy.get('#opfab-timeline-link-period-J').click();

        // send cards
        cy.sendCard('cypress/feed/customEvent.json', afternoonDate.getTime(), afternoonDate.getTime() + 5*60*1000);
        cy.wait(500);
        cy.tick(1000);
        cy.sendCard('cypress/feed/customAlarm.json', justBeforeMidnightDate.getTime(), justBeforeMidnightDate.getTime() + 5*60*1000);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1000);

        // Check the card is received
        cy.get("#opfab-timeline-title").should("have.text", " 31 December 2028 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 2);


        // click on the button to display the following day
        cy.get("#opfab-timeline-link-move-right").click();

        // The card before midnight should be visible
        cy.get("#opfab-timeline-title").should("have.text", " 01 January 2029 ");
        //cy.get("of-custom-timeline-chart").find("circle").should('have.length', 1);

    })

    it('Check the overlap in Week view when timeline shifts', 
    { defaultCommandTimeout: 10000}, function () {

        // In English week timelines ends on Friday
        // Logging on Friday, 29th of December 2028, at 23h30l
        // NB : for some reason month seems to start at 0
        const afternoonDate = new Date(2028, 11, 29, 15, 30);
        const justBeforeMidnightDate = new Date(2028, 11, 29, 23, 55);
        cy.loginWithClock(justBeforeMidnightDate);

        cy.get('#opfab-timeline-link-period-W').click();

        // send cards
        cy.sendCard('cypress/feed/customEvent.json', afternoonDate.getTime(), afternoonDate.getTime() + 5*60*1000);
        cy.wait(500);
        cy.tick(1000);
        cy.sendCard('cypress/feed/customAlarm.json', justBeforeMidnightDate.getTime(), justBeforeMidnightDate.getTime() + 5*60*1000);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1000);

        // Check the card is received
        cy.get("#opfab-timeline-title").should("have.text", " 23/12/2028 - 30/12/2028 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 2);


        // go 35 minutes in the future 
        cy.tick(35*60*1000);

        // The card before midnight should be visible
        cy.get("#opfab-timeline-title").should("have.text", " 30/12/2028 - 06/01/2029 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 1);
    })


    it('Check the overlap in Month view when timeline shifts', 
    { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31st of December 2028, at 23h30
        // NB : for some reason month seems to start at 0
        const afternoonDate = new Date(2028, 11, 31, 15, 30);
        const justBeforeMidnightDate = new Date(2028, 11, 31, 23, 55);
        cy.loginWithClock(justBeforeMidnightDate);

        cy.get('#opfab-timeline-link-period-M').click();

        // send cards
        cy.sendCard('cypress/feed/customEvent.json', afternoonDate.getTime(), afternoonDate.getTime() + 5*60*1000);
        cy.wait(500);
        cy.tick(1000);
        cy.sendCard('cypress/feed/customAlarm.json', justBeforeMidnightDate.getTime(), justBeforeMidnightDate.getTime() + 5*60*1000);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1000);

        // Check the card is received
        cy.get("#opfab-timeline-title").should("have.text", " DECEMBER 2028 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 2);


        // go 35 minutes in the future 
        cy.tick(35*60*1000);

        // The card before midnight should be visible
        cy.get("#opfab-timeline-title").should("have.text", " JANUARY 2029 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 1);
    })


    it('Check the overlap in Year view when timeline shifts', 
    { defaultCommandTimeout: 10000}, function () {

        // Logging on Sunday, 31st of December 2028, at 23h30
        // NB : for some reason month seems to start at 0
        const afternoonDate = new Date(2028, 11, 31, 15, 30);
        const justBeforeMidnightDate = new Date(2028, 11, 31, 23, 55);
        cy.loginWithClock(justBeforeMidnightDate);

        cy.get('#opfab-timeline-link-period-Y').click();

        // send cards
        cy.sendCard('cypress/feed/customEvent.json', afternoonDate.getTime(), afternoonDate.getTime() + 5*60*1000);
        cy.wait(500);
        cy.tick(1000);
        cy.sendCard('cypress/feed/customAlarm.json', justBeforeMidnightDate.getTime(), justBeforeMidnightDate.getTime() + 5*60*1000);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1000);

        // Check the card is received
        cy.get("#opfab-timeline-title").should("have.text", " 2028 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 2);


        // go 35 minutes in the future 
        cy.tick(35*60*1000);

        // The card before midnight should be visible
        cy.get("#opfab-timeline-title").should("have.text", " 2029 ");
        cy.get("of-custom-timeline-chart").find("circle").should('have.length', 1);
    })


})