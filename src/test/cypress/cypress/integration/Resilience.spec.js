/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {FeedCommands} from '../support/feedCommands';
import {ScriptCommands} from "../support/scriptCommands";

describe('Resilience tests', function () {
    const opfab = new OpfabGeneralCommands();
    const feed = new FeedCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
        script.loadTestConf();
    });

    beforeEach('Delete all cards', function () {
        script.deleteAllCards();
    });

    it('Check loading spinner when nginx is stopped and card reception after nginx restart', function () {
        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(0);
        stopNginx();
        checkLoadingSpinnerIsVisible();
        startNginx();
        script.send6TestCards();
        feed.checkNumberOfDisplayedCardsIs(6);
        checkLoadingSpinnerIsNotVisible();
    });

    it('Check card reception after rabbitMQ restart ', function () {
        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(0);
        restartRabbitMQ();
        script.send6TestCards();
        feed.checkNumberOfDisplayedCardsIs(6);
    });

    it('Check card reception when cards-consultation service is restarted ', function () {
    // WARNING : the following test will only be relevant if using docker mode
    // in dev mode it will execute but the cards-consultation services will not be restart
        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(0);
        cy.wait(5000); // wait for subscription to be fully working

        cy.exec('docker stop cards-consultation', {failOnNonZeroExit: false}).then((result) => {
            // only if docker stop works, so it will not be executed in dev mode
            if (result.code === 0) {
                script.send6TestCards();  // Send 6 cards when cards-consultation service is down
                checkLoadingSpinnerIsVisible();
                restartCardsConsultationService();
                feed.checkNumberOfDisplayedCardsIs(6);
            }
        });
    });

    function stopNginx() {
        cy.exec('docker stop web-ui');
        cy.wait(15000);
    }

    function checkLoadingSpinnerIsVisible() {
        cy.get('#opfab-connecting-spinner');
    }

    function startNginx() {
        cy.exec('docker start web-ui');
        cy.wait(20000); // Wait for subscription to be fully restored
    }

    function checkLoadingSpinnerIsNotVisible() {
        cy.get('#opfab-connecting-spinner').should('not.exist');
    }

    function restartRabbitMQ() {
        cy.exec('docker restart rabbit');
        cy.wait(15000); // Wait for rabbitMQ to be fully up
    }

    function restartCardsConsultationService() {
        cy.exec('docker start cards-consultation');
        script.waitForOpfabToStart();
        cy.wait(20000); // wait for subscription to be fully restored

    }
});
