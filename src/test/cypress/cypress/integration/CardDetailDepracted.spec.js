/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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
import {FeedCommands} from '../support/feedCommands';
import {ScriptCommands} from "../support/scriptCommands";

describe('Card detail (deprecated calls to templateGateway) ', function () {
    const opfab = new OpfabGeneralCommands();
    const feed = new FeedCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        script.resetUIConfigurationFiles();
        script.deleteAllSettings();
        script.loadTestConf();
        script.deleteAllCards();
        script.deleteAllArchivedCards();
        script.sendCard('cypress/cardDetail/cardDetailDeprecated.json');
    });

    describe('Check card detail deprecated calls to templateGateway', function () {

        it(`Check card detail`, function () {
            opfab.loginWithUser('operator1_fr');
            feed.openFirstCard();


            // Check templateGateway calls
            cy.get('#templateGateway-getEntityName').contains('Control Center FR North');
            cy.get('#templateGateway-getEntityName-unknownEntity').contains('unknownEntity');
            cy.get('#templateGateway-isUserAllowedToRespond').contains('true');
            cy.get('#templateGateway-isUserMemberOfAnEntityRequiredToRespond').contains('true');
            cy.get('#templateGateway-getEntityUsedForUserResponse').contains(/^ENTITY1_FR$/);
            cy.get('#templateGateway-getDisplayContext').contains(/^realtime$/);
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[0]:id=ENTITY1_FR,name=Control Center FR North,description=Control Center FR North,entityAllowedToSendCard=true,parents=ENTITY_FR,labels=FR1 label'
            );
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[1]:id=ENTITY2_FR,name=Control Center FR South,description=Control Center FR South,entityAllowedToSendCard=true,parents=ENTITY_FR,labels=undefined'
            );
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[2]:id=ENTITY3_FR,name=Control Center FR East,description=Control Center FR East,entityAllowedToSendCard=true,parents=ENTITY_FR,labels=undefined'
            );
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[3]:id=ENTITY4_FR,name=Control Center FR West,description=Control Center FR West,entityAllowedToSendCard=true,parents=ENTITY_FR,labels=undefined'
            );
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[4]:id=ENTITY_FR,name=French Control Centers,description=French Control Centers,entityAllowedToSendCard=false,parents=undefined,labels=undefined'
            );
            cy.get('#templateGateway-getAllEntities').contains(
                'entity[6]:id=IT_SUPERVISOR_ENTITY,name=IT SUPERVISION CENTER,description=IT SUPERVISION CENTER,entityAllowedToSendCard=true,parents=EUROPEAN_SUPERVISION_CENTERS,labels=undefined'
            );
            cy.get('#templateGateway-getEntity-ENTITY1_FR').contains(
                /^ENTITY1_FR,Control Center FR North,Control Center FR North,true,ENTITY_FR,FR1 label$/
            );
            cy.get('#screenSize').contains('md');
            cy.get('#templateGateway-onTemplateRenderingComplete').contains('ok');

            // see card in full screen
            cy.get('#opfab-card-detail-fullscreen-button').click();
            cy.get('#screenSize').contains('lg');
            // go back in standard screen
            cy.get('#opfab-card-detail-fullscreen-button').click();
            cy.get('#screenSize').contains('md');
        });

        
        

        it(`Check card detail in archives`, function () {
            opfab.loginWithUser('operator1_fr');
            opfab.navigateToArchives();
            // We click the search button
            cy.get('#opfab-archives-logging-btn-search').click();

            // Click on the card
            cy.waitDefaultTime();
            cy.get('#opfab-archives-cards-list').find('.opfab-archive-sev-information').first().click();

            // Check the spinner appears when clicking on the button
            cy.get('#templateGateway-display-spinner-button').click();
            opfab.checkLoadingSpinnerIsDisplayed();
            opfab.checkLoadingSpinnerIsNotDisplayed();


            // Check templateGateway calls
            cy.get('#templateGateway-getEntityName').contains('Control Center FR North');
            cy.get('#templateGateway-getEntityName-unknownEntity').contains('unknownEntity');

            // in archives is isUserAllowedToRespond always return false
            cy.get('#templateGateway-isUserAllowedToRespond').contains('false');

            cy.get('#templateGateway-isUserMemberOfAnEntityRequiredToRespond').contains('true');
            cy.get('#templateGateway-getDisplayContext').contains(/^archive$/);
            cy.get('#screenSize').contains('lg');
            cy.get('#templateGateway-onTemplateRenderingComplete').contains('ok');


  
        });
    });

});
