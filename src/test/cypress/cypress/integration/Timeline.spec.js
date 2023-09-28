/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ScriptCommands} from "../support/scriptCommands";

describe('Time line moves', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    const SECONDS = 1000;
    const MINUTES = 60000;
    const HOURS = 3600000;


    before('Set up configuration and cards', function () {
        script.loadTestConf();
        // send heartbeat every 100 hours 
        // to avoid sending many heartbeats request when going in the future with clock
        script.setPropertyInConf('heartbeatSendingInterval','web-ui',360000);
    });

    after('Reset conf', function () {
        script.resetUIConfigurationFiles();
    });

    beforeEach('Reset UI configuration file ', function () {
        script.deleteAllCards();
    })
  
    it('Check timelime manual moves in TR mode', function () {

        // NB : month  starts at 0
       
        opfab.loginWithClock(new Date(2030, 2, 31, 11, 59));
        

        setTimeLineDomain('TR');
        checkFirstTickLabel(" 09h30 ");
        moveRight();
        checkFirstTickLabel(" 11h30 ");
        moveRight();
        checkFirstTickLabel(" 13h30 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 09h30 ");

        moveLeft();
        checkFirstTickLabel(" 07h30 ");
        moveLeft();
        checkFirstTickLabel(" 05h30 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 09h30 ");
    })

    it('Check timelime manual moves in Day mode', function () {


        opfab.loginWithClock(new Date(2030, 2, 31, 11, 59));

        setTimeLineDomain('J');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ");
        moveRight();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 01 April 2030 ")
        moveRight();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 02 April 2030 ")

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ")

        moveLeft();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30 March 2030 ")
        moveLeft();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 29 March 2030 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ")
    })

    it('Check timelime manual moves in 7 Day mode', function () {

        opfab.loginWithClock(new Date(2030, 2, 31, 10, 50));

        setTimeLineDomain('7D');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 07/04/2030 ");
        moveRight();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 01/04/2030 - 09/04/2030 ");
        moveRight();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 02/04/2030 - 10/04/2030 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 07/04/2030 ");

        moveLeft();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 07/04/2030 ");
        moveLeft();
        checkFirstTickLabel(" 00h ");
        checkTitle(" 29/03/2030 - 06/04/2030 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 07/04/2030 ");
    })

    it('Check timelime manual moves in month mode', function () {

        opfab.loginWithClock(new Date(2030, 2, 31, 10, 50));

        setTimeLineDomain('M');
        checkFirstTickLabel(" FRI 01 ");
        checkTitle(" MARCH 2030 ");
        moveRight();
        checkFirstTickLabel(" MON 01 ");
        checkTitle(" APRIL 2030 ");
        moveRight();
        checkFirstTickLabel(" WED 01 ");
        checkTitle(" MAY 2030 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" FRI 01 ");
        checkTitle(" MARCH 2030 ");

        moveLeft();
        checkFirstTickLabel(" FRI 01 ");
        checkTitle(" FEBRUARY 2030 ");
        moveLeft();
        checkFirstTickLabel(" TUE 01 ");
        checkTitle(" JANUARY 2030 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" FRI 01 ");
        checkTitle(" MARCH 2030 ");
    })

    it('Check timelime manual moves in year mode', function () {

        opfab.loginWithClock(new Date(2030, 2, 31, 10, 50));

        setTimeLineDomain('Y');
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");
        moveRight();
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2031 ");
        moveRight();
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2032 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");

        moveLeft();
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2029 ");
        moveLeft();
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2028 ");

        unlockTimeLine(); // timeline shall return to initial position
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");
    })


    it('Check timeline moves when unlocked in real time view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 55)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('TR');
        checkFirstTickLabel(" 21h30 ");
        checkTitle(" 31 March 2030 ");

        // send a card with a bubble a the start of the time line 
        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime() - (2 * HOURS + 15 * MINUTES), currentDate.getTime() + 5 * MINUTES);
        cy.tick(1 * SECONDS);
        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime(), currentDate.getTime() + 10 * HOURS);

        // Wait for the card to arrive
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:55 ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:10 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 22h ");
        // the bubble at the start of the timeline has disappear 
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:25 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 22h ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:40 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 22h30 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:55 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 22h30 ");
        checkHaveCircle(1);

    })

    it('Check timeline does not moves when locked in real time view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 55)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('TR');
        lockTimeLine();
        checkFirstTickLabel(" 21h30 ");
        checkTitle(" 31 March 2030 ")

        // send a card with a bubble a the start of the time line 
        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime() - (2 * HOURS + 15 * MINUTES), currentDate.getTime() + 5 * MINUTES);
        cy.tick(1 * SECONDS);
        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime(), currentDate.getTime() + 10 * HOURS);

        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:55 ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:10 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 21h30 ");
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:25 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 21h30 ");
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:40 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 21h30 ");
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:55 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 21h30 ");
        checkHaveCircle(2);

    })

    it('Check timeline moves when unlocked in day view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 35)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('J');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:35 ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 31/03/30 23:50 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:05 ");
        checkTitle(" 01 April 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(0);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 5 * HOURS, currentDate.getTime() + 6 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:20 ");
        checkTitle(" 01 April 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        cy.tick(10 * HOURS);
        checkTimeCursorText(" 01/04/30 10:20 ");
        checkTitle(" 01 April 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

    });


    it('Check timeline does not moves when locked in day view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 35)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('J');
        lockTimeLine();
        checkFirstTickLabel(" 00h ");

        checkTitle(" 31 March 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * 60 * 1000);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:35 ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 31/03/30 23:50 ");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        cy.get("#opfab-timeline-time-cursor").should("not.exist"); // no realtime bar anymore 
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        // send a card that should not be visible
        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 5 * HOURS, currentDate.getTime() + 6 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        cy.get("#opfab-timeline-time-cursor").should("not.exist");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        cy.tick(10 * HOURS);
        cy.get("#opfab-timeline-time-cursor").should("not.exist");
        checkTitle(" 31 March 2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

    });

    it('Check timeline moves when unlocked in 7 day view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 35)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('7D');
        checkFirstTickLabel(" 08h ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * 60 * 1000);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:35 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 31/03/30 23:50 ");
        checkFirstTickLabel(" 08h ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:05 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkFirstTickLabel(" 16h ");
        checkHaveCircle(1);

        cy.tick(12 * HOURS);
        checkTimeCursorText(" 01/04/30 12:05 ");
        checkTitle(" 01/04/2030 - 09/04/2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(0);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 5 * HOURS, currentDate.getTime() + 6 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 12:20 ");
        checkTitle(" 01/04/2030 - 09/04/2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 02/04/30 12:20 ");
        checkTitle(" 02/04/2030 - 10/04/2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(0);

    });

    it('Check timeline does not moves when locked in 7 day view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 35)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('7D');
        lockTimeLine();
        checkFirstTickLabel(" 08h ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * 60 * 1000);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:35 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 31/03/30 23:50 ");
        checkFirstTickLabel(" 08h ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:05 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkFirstTickLabel(" 08h ");
        checkHaveCircle(1);

        cy.tick(12 * HOURS);
        checkTimeCursorText(" 01/04/30 12:05 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkFirstTickLabel(" 08h ");
        checkHaveCircle(1);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 5 * HOURS, currentDate.getTime() + 6 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(2);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 12:20 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkFirstTickLabel(" 08h ");
        checkHaveCircle(2);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 02/04/30 12:20 ");
        checkTitle(" 31/03/2030 - 08/04/2030 ");
        checkFirstTickLabel(" 08h ");
        checkHaveCircle(2);

    });

    it('Check timeline moves when unlocked in week day view', function () {

        const currentDate = new Date(2030, 3, 4, 22, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('W');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 04/04/30 22:00 ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 05/04/30 22:00 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 06/04/30 22:00 ");
        checkTitle(" 06/04/2030 - 13/04/2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(0);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

    });


    it('Check timeline does not moves when unlocked in week day view', function () {

        const currentDate = new Date(2030, 3, 4, 22, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('W');
        lockTimeLine();

        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 04/04/30 22:00 ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 05/04/30 22:00 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkNoTimeCursor();
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkFirstTickLabel(" 00h ");
        checkHaveCircle(1);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * HOURS);
        checkHaveCircle(1);

    });

    it('Check timeline moves when unlocked in month view', function () {

        const currentDate = new Date(2030, 3, 30, 15, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('M');
        checkFirstTickLabel(" MON 01 ");
        checkTitle(" APRIL 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 30/04/30 15:00 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 01/05/30 15:00 ");
        checkFirstTickLabel(" WED 01 ");
        checkTitle(" MAY 2030 ");
        checkHaveCircle(0);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

    });


    it('Check timeline does not moves when locked in month view', function () {

        const currentDate = new Date(2030, 3, 30, 15, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('M');
        lockTimeLine();

        checkFirstTickLabel(" MON 01 ");
        checkTitle(" APRIL 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 30/04/30 15:00 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkNoTimeCursor();
        checkFirstTickLabel(" MON 01 ");
        checkTitle(" APRIL 2030 ");
        checkHaveCircle(1);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

    });



    it('Check timeline moves when unlocked in year view', function () {

        const currentDate = new Date(2030, 11, 30, 8, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('Y');
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 30/12/30 08:00 ");
        checkHaveCircle(1);

        cy.tick(48 * HOURS);
        checkTimeCursorText(" 01/01/31 08:00 ");
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2031 ");
        checkHaveCircle(0);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

    });


    it('Check timeline does not moves when locked in year view', function () {

        const currentDate = new Date(2030, 11, 30, 8, 0);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('Y');
        lockTimeLine();

        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 30/12/30 08:00 ");
        checkHaveCircle(1);

        cy.tick(48 * HOURS);
        checkNoTimeCursor();
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");
        checkHaveCircle(1);

        script.sendCard('cypress/feed/customAlarm.json', currentDate.getTime() + 72 * HOURS, currentDate.getTime() + 80 * HOURS);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkHaveCircle(1);

    });

    it('Check timeline move automatically with overlap in day view', function () {

        const currentDate = new Date(2030, 2, 31, 23, 55)
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('J');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 31 March 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/03/30 23:55 ");
        checkTitle(" 31 March 2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:10 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 01 April 2030 ");
        checkHaveCircle(1);

        cy.tick(15 * MINUTES);
        checkTimeCursorText(" 01/04/30 00:25 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 01 April 2030 ");
        checkHaveCircle(1);

        // check when we move manually we have no overlap 
        moveLeft();
        checkNoTimeCursor();
        checkHaveCircle(1);
        moveRight();
        checkHaveCircle(0);

    });

    it('Check timeline move automatically with overlap in week view', function () {

        const currentDate = new Date(2030, 3, 5, 23, 50);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('W');
        checkFirstTickLabel(" 00h ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 05/04/30 23:50 ");
        checkTitle(" 30/03/2030 - 06/04/2030 ");
        checkHaveCircle(1);

        cy.tick(20 * MINUTES);
        checkTimeCursorText(" 06/04/30 00:10 ");
        checkFirstTickLabel(" 00h ");
        checkTitle(" 06/04/2030 - 13/04/2030 ");
        checkHaveCircle(1);

        // check when we move manually we have no overlap 
        moveLeft();
        checkNoTimeCursor();
        checkHaveCircle(1);
        moveRight();
        checkHaveCircle(0);

    });

    it('Check timeline move automatically with overlap in month view', function () {

        const currentDate = new Date(2030, 3, 30, 23, 52);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('M');
        checkFirstTickLabel(" MON 01 ");
        checkTitle(" APRIL 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 30/04/30 23:52 ");
        checkHaveCircle(1);

        cy.tick(24 * HOURS);
        checkTimeCursorText(" 01/05/30 23:52 ");
        checkFirstTickLabel(" WED 01 ");
        checkTitle(" MAY 2030 ");
        checkHaveCircle(1);


        // check when we move manually we have no overlap 
        moveLeft();
        checkNoTimeCursor();
        checkHaveCircle(1);
        moveRight();
        checkHaveCircle(0);

    });

    it('Check timeline move automatically with overlap in year view', function () {

        const currentDate = new Date(2030, 11, 31, 23, 46);
        opfab.loginWithClock(currentDate);

        setTimeLineDomain('Y');
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2030 ");

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime(), currentDate.getTime() + 5 * MINUTES);
        cy.wait(500);
        cy.tick(1 * SECONDS);
        checkTimeCursorText(" 31/12/30 23:46 ");
        checkHaveCircle(1);

        cy.tick(2 * HOURS);
        checkTimeCursorText(" 01/01/31 01:46 ");
        checkFirstTickLabel(" 1 Jan ");
        checkTitle(" 2031 ");
        checkHaveCircle(1);


        // check when we move manually we have no overlap 
        moveLeft();
        checkNoTimeCursor();
        checkHaveCircle(1);
        moveRight();
        checkHaveCircle(0);

    });

    it('Check timeline circles have valid popover',
      {
        retries: {
          runMode: 2,  // to avoid flaky test with cy.get("#opfab-timeline-bubble-btn1").click();
          openMode: 1,
        },
      }, function () {

        opfab.loginWithUser("operator1_fr");
        const currentDate = new Date(); 

        checkHaveCircle(0);

        script.sendCard('cypress/feed/customEvent.json', currentDate.getTime() + 2 * HOURS, currentDate.getTime() + 5 * HOURS);
        checkHaveCircle(1);
        checkNthCircleContains(0,"1");

        hoverNthCircle(0);
        cy.get(".popover-body").find('button').should("have.length", 1);
        cy.get("#opfab-div-card-template-processed").should("not.exist");

        clickNthCircle(0);
        cy.get("#opfab-div-card-template-processed").should("exist");
        checkDisplayedCardTitle("State to test template rendering features");
    
        const startDate = currentDate.getTime() + 1 * HOURS;
        script.sendCard('cypress/feed/customAlarm.json', startDate, currentDate.getTime() + 5 * HOURS);
        script.sendCard('cypress/feed/chartLineWithCustomDate.json',startDate);

         // wait we receive the cards (when we have 3 cards in the feed)
         cy.get('of-light-card').should('have.length',3);
         // we have two bubbles on the timeline as 2 cards have the same startDate
         checkHaveCircle(2);
         checkNthCircleContains(0,"1");
         checkNthCircleContains(1,"2");

        // Clicking on a circle with several cards should not change the currently displayed card
        clickNthCircle(1);
        cy.get("#opfab-div-card-template-processed").should("exist");
        checkDisplayedCardTitle("State to test template rendering features");


        cy.get(".popover-body").find('button').should("have.length", 2);
        cy.get("#opfab-timeline-bubble-btn1").click();
        
        checkDisplayedCardTitle("Electricity consumption forecast");
    });

    function setTimeLineDomain(domain) {
        cy.get('#opfab-timeline-link-period-' + domain).click();
    }

    function lockTimeLine() {
        cy.get("#opfab-timeline-lock").click();
    }

    function unlockTimeLine() {
        cy.get("#opfab-timeline-unlock").click();
    }

    function moveRight() {
        cy.get("#opfab-timeline-link-move-right").click();
    }

    function moveLeft() {
        cy.get("#opfab-timeline-link-move-left").click();
    }

    function checkHaveCircle(nb) {
        cy.get("of-custom-timeline-chart").find("ellipse").should('have.length', nb);
    }

    function checkNthCircleContains(nb,value) {
        cy.get('#opfab-timelineCircle-' + nb ).within(() => {
            cy.get("text").contains(value);
        })  
    } 

    function hoverNthCircle(nb) {
        cy.get('#opfab-timelineCircle-' + nb).trigger('mouseenter');
    }


    function clickNthCircle(nb) {
        cy.get('#opfab-timelineCircle-' + nb).click();
    }

    function checkTitle(title) {
        cy.get("#opfab-timeline-title").should("have.text", title);
    }

    function checkTimeCursorText(text) {
        cy.get("#opfab-timeline-time-cursor").should("have.text", text);
    }

    function checkNoTimeCursor() {
        cy.get("#opfab-timeline-time-cursor").should("not.exist");
    }

    function checkFirstTickLabel(label) {
        cy.get(".axis").find("text").first().should("have.text", label);
    }

    function checkDisplayedCardTitle(title) {
        cy.get("#opfab-card-title").should("have.text", title.toUpperCase());
    }

    function hideTimeLine() {
        cy.get('#opfab-timeline-link-hide-timeline > a').click();
    }

    function showTimeLine() {
        cy.get('#opfab-timeline-link-show-timeline > a').click();
    }
})
