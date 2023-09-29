/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {ActivityAreaCommands} from '../support/activityAreaCommands';
import {ScriptCommands} from '../support/scriptCommands';
import {CardCommands} from '../support/cardCommands';
import {FeedCommands} from '../support/feedCommands';
import {UserCardCommands} from '../support/userCardCommands';

describe('Response card tests', function () {
    const opfab = new OpfabGeneralCommands();
    const activityArea = new ActivityAreaCommands();
    const script = new ScriptCommands();
    const card = new CardCommands();
    const feed = new FeedCommands();
    const usercard = new UserCardCommands();

    before('Set up configuration and clean cards', function () {
        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        script.resetUIConfigurationFiles();

        script.loadTestConf();
        // Clean up existing cards
        script.deleteAllCards();
        script.deleteAllArchivedCards();
        script.deleteAllSettings();

        script.sendCard('defaultProcess/question.json');
    });

    it('Check card response for operator1_fr ', function () {
        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice1');

        card.checkEntityIsOrangeInCardHeader('ENTITY1_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_FR');

        // ENTITY3 is allowed to response but not required --> it should not be visible in the header
        card.checkEntityIsNotVisibleInCardHeader('ENTITY3_FR');

        // ENTITY4 is a recipient but not allowed to response --> it should not be visible in the header
        card.checkEntityIsNotVisibleInCardHeader('ENTITY4_FR');

        // Response button is present
        cy.get('#opfab-card-details-btn-response');
        cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');

        // Respond to the card
        cy.get('#question-choice1').click();
        card.sendResponse();

        // The label of the validate button must be "MODIFY RESPONSE" now
        cy.get('#opfab-card-details-btn-response').should('have.text', 'MODIFY RESPONSE');

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        //check the response has been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        card.checkEntityIsGreenInCardHeader('ENTITY1_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_FR');

        // update card
        script.sendCard('defaultProcess/question.json');

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Respond  to the new card

        cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');

        cy.waitDefaultTime(); // to avoid detach dom error, we need to wait the new template has been rendered
        cy.get('#question-choice3').click();
        card.sendResponse();

        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');
    });

    it('Check READONLY operator1_crisisroom cannot respond ', function () {
        opfab.loginWithUser('operator1_crisisroom');
        feed.checkNumberOfDisplayedCardsIs(1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice1');

        cy.get('#opfab-card-details-btn-response').should('not.exist');
    });

    it('Check card response for operator2_fr ', function () {
        opfab.loginWithUser('operator2_fr');
        feed.checkNumberOfDisplayedCardsIs(1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR has been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        card.checkEntityIsGreenInCardHeader('ENTITY1_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_FR');

        // Response button is present
        cy.get('#opfab-card-details-btn-response');

        // Respond to the card
        cy.get('#question-choice2').click();
        card.sendResponse();

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        // Check the response from current user has been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header
        card.checkEntityIsGreenInCardHeader('ENTITY1_FR'); // entity 1 color is green
        card.checkEntityIsGreenInCardHeader('ENTITY2_FR'); // entity 2 color is green
    });

    // operator4_fr is member of ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR and the question card sent can be responded by
    // ENTITY1_FR, ENTITY2_FR, ENTITY3_FR
    it('Check card response for operator4_fr ', function () {
        opfab.loginWithUser('operator4_fr');
        feed.checkNumberOfDisplayedCardsIs(1);

        // See in the feed the fact that someone from ENTITY1_FR has already responded (icon present)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR and ENTITY2_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header
        card.checkEntityIsGreenInCardHeader('ENTITY1_FR');
        card.checkEntityIsGreenInCardHeader('ENTITY2_FR');

        card.modifyResponse();

        // Respond to the card
        cy.get('#question-choice3').click();
        card.sendResponse();

        // Check the popup for the entities choice is displayed
        cy.get('#opfab-card-details-entities-choice-selector').should('exist');
        cy.get('#opfab-card-details-entities-choice-selector').find('.vscomp-option-text').should('have.length', 3);
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-option-text')
            .eq(0)
            .should('contain.text', 'Control Center FR East');
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-option-text')
            .eq(1)
            .should('contain.text', 'Control Center FR North');
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-option-text')
            .eq(2)
            .should('contain.text', 'Control Center FR South');

        // We choose ENTITY3_FR (East) which is already selected
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-value')
            .should('contain.text', 'Control Center FR East');

        cy.get('#opfab-card-details-entity-choice-btn-confirm').click();

        // Check the response from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');

        // operator4_fr updates the answer of ENTITY1_FR and ENTITY2_FR
        card.modifyResponse();
        cy.get('#question-choice1').click();
        cy.get('#question-choice3').click(); //to uncheck the box
        card.sendResponse();
        cy.get('#opfab-card-details-entities-choice-selector').click();
        cy.get('#opfab-card-details-entities-choice-selector').find('.vscomp-option-text').eq(0).click(); // We unselect ENTITY3_FR (East)
        cy.get('#opfab-card-details-entity-choice-btn-confirm').should('be.disabled'); // Check if the button is disabled when no entity is selected
        cy.get('#opfab-card-details-entities-choice-selector').find('.vscomp-option-text').eq(1).click(); // We select ENTITY1_FR (North)
        cy.get('#opfab-card-details-entities-choice-selector').find('.vscomp-option-text').eq(2).click(); // We select ENTITY2_FR (South)
        cy.get('#opfab-card-details-entities-choice-selector').click();
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-value')
            .should('contain.text', 'Control Center FR North');
        cy.get('#opfab-card-details-entities-choice-selector')
            .find('.vscomp-value')
            .should('contain.text', 'Control Center FR South');
        cy.get('#opfab-card-details-entity-choice-btn-confirm').click();

        cy.waitDefaultTime();
        // Check the response from ENTITY1_FR and ENTITY2_FR have been updated and the other response is still the same
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ');

        // operator4_fr disconnect from ENTITY_1_FR and ENTITY2_FR (the popup for entities choice must not be displayed)
        // because the only one entity allowed to respond for him is now ENTITY3_FR
        opfab.navigateToActivityArea();

        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        cy.get('.opfab-checkbox').contains('Control Center FR North').click({force: true});
        cy.get('.opfab-checkbox').contains('Control Center FR South').click({force: true});
        activityArea.save();
        cy.waitDefaultTime();
        opfab.navigateToFeed();
        feed.openFirstCard();
        card.modifyResponse();
        cy.get('#question-choice2').click(); // to check the box
        card.sendResponse();
        cy.get('#opfab-card-details-entities-choice-selector').should('not.exist'); // entities choice popup must not be displayed
        cy.waitDefaultTime();
        // Check the response from ENTITY3_FR (East) has been updated and the other responses are still the same
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');

        // We reconnect operator4_fr to ENTITY1_FR, ENTITY2_FR
        opfab.navigateToActivityArea();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click({force: true});
        cy.get('.opfab-checkbox').contains('Control Center FR North').click({force: true});
        activityArea.save();
    });

    it('Check itsupervisor1 see the card but cannot respond ', function () {
        opfab.loginWithUser('itsupervisor1');
        feed.checkNumberOfDisplayedCardsIs(1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR and ENTITY2_FR has been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');

        card.checkEntityIsGreenInCardHeader('ENTITY1_FR');
        card.checkEntityIsGreenInCardHeader('ENTITY2_FR');

        // Response button is not present
        cy.get('#opfab-card-details-btn-response').should('not.exist');
    });

    it('Check response for operator1_fr is still present after update of card with keepChildCard=true re-logging', function () {
        script.sendCard('defaultProcess/questionWithKeepChildCards.json');

        opfab.loginWithUser('operator1_fr');
        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        feed.openFirstCard();

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the old responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');

        card.checkEntityIsGreenInCardHeader('ENTITY1_FR');
        card.checkEntityIsGreenInCardHeader('ENTITY2_FR');
    });

    it('Check response for  operator1_fr  is not present after update of card with keepChildCard= false re-logging', function () {
        script.sendCard('defaultProcess/question.json');

        opfab.loginWithUser('operator1_fr');
        feed.openFirstCard();

        // Should not have an icon of response
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the old responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have not been integrated in the template
        cy.get('#response_from_ENTITY1_FR').should('not.exist');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        card.checkEntityIsOrangeInCardHeader('ENTITY1_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_FR');
    });

    it('Check responses in archived cards detail', function () {
        opfab.loginWithUser('operator1_fr');
        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();
        cy.waitDefaultTime();
        // We click the search button
        cy.get('#opfab-archives-logging-btn-search').click();

        // operator1_fr should see 3 archived cards
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', 4);

        // open card detail for card with keepChildCards=false and check there are no responses
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(0).click();
        cy.waitDefaultTime();
        cy.get('of-simplified-card-view').should('exist');

        //Check the responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have not been integrated in the template
        cy.get('#response_from_ENTITY1_FR').should('not.exist');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // close card detail
        cy.get('#opfab-archives-card-detail-close').click();

        // open card detail for card with keepChildCards=true and check it should have 3 child cards
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(1).click();
        cy.waitDefaultTime();
        cy.get('of-simplified-card-view').should('exist');
        // Check the responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have been integrated in the template
        cy.get('#childs-div').find('tr').should('have.length', 4);
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY2_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
        cy.get('#response_from_ENTITY3_FR')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ');

        // close card detail
        cy.get('#opfab-archives-card-detail-close').click();

        // open card detail for first card and check it should have 1 child card
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(3).click();
        cy.waitDefaultTime();
        cy.get('of-simplified-card-view').should('exist');
        // Check the responses from ENTITY1_FR  has been integrated in the template
        cy.get('#childs-div').find('tr').should('have.length', 2);
        cy.get('#response_from_ENTITY1_FR')
            .next()
            .should('have.text', ' OK ')
            .next()
            .should('have.text', ' NOK ')
            .next()
            .should('have.text', ' NOK ');
    });

    it('Check response button is disabled while sending response', function () {
        opfab.loginWithUser('operator1_fr');
        feed.openFirstCard();

        // Mock and delay card response 
        cy.intercept('/cardspub/cards/userCard', {
            statusCode: 201,
            delay: 3000
        });

        // Check template is loaded
        cy.get('#question-choice1');

        cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');
        card.sendResponse();

        // Send response button should be disabled
        cy.get('#opfab-card-details-btn-response').should('be.disabled');

        // Modify response button should be enabled after response is sent
        cy.get('#opfab-card-details-btn-response').should('not.be.disabled');
        cy.get('#opfab-card-details-btn-response').should('have.text', 'MODIFY RESPONSE');
    });

    it('Check detail card header response dropdownList', () => {
        script.deleteAllCards();
        opfab.loginWithUser('operator1_fr');
        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Message or question');
        usercard.selectState('Question');
        cy.get('#opfab-question-label').should('have.text', 'QUESTION');
        cy.get('#usercard_question_input').invoke('val', 'question'); // the cy.type does not work (no explanation found),  using invoke works 
        usercard.selectRecipient('Control Center FR East');
        usercard.selectRecipient('Control Center FR North');
        usercard.selectRecipient('Control Center FR South');
        usercard.selectRecipient('Control Center FR West');
        usercard.selectRecipient('Control Center IT Center');
        usercard.selectRecipient('Control Center IT North');
        usercard.previewThenSendCard();
        feed.openFirstCard();

        card.checkEntityIsOrangeInCardHeader('ENTITY1_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY3_FR');
        card.checkEntityIsNotVisibleInCardHeader('ENTITY4_FR');
        card.checkEntityIsNotVisibleInCardHeader('ENTITY1_IT');
        card.checkEntityIsNotVisibleInCardHeader('ENTITY2_IT');

        card.openEntityDropdownInCardHeader();

        // The other entities are now visible
        card.checkEntityIsOrangeInCardHeader('ENTITY4_FR');
        card.checkEntityIsOrangeInCardHeader('ENTITY1_IT');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_IT');

        opfab.logout();
        opfab.loginWithUser('operator1_it');
        feed.openFirstCard();
        cy.get('#template_response_input').type('my response');
        card.sendResponse();

        card.openEntityDropdownInCardHeader();

        card.checkEntityIsOrangeInCardHeader('ENTITY4_FR');
        card.checkEntityIsGreenInCardHeader('ENTITY1_IT');
        card.checkEntityIsOrangeInCardHeader('ENTITY2_IT');
    });

    it('Check response publisher set from template', () => {
        script.deleteAllCards();
        opfab.loginWithUser('operator4_fr');
        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Message or question');
        usercard.selectState('Confirmation');
        cy.get('#question').invoke('val', 'question'); // the cy.type does not work (no explanation found),  using invoke works 
        cy.get('#message').invoke('val', 'Cypress test for response publisher');
        usercard.selectRecipient('Control Center FR East');
        usercard.selectRecipient('Control Center FR North');
        usercard.selectRecipient('Control Center FR South');
        usercard.selectRecipient('Control Center FR West');
        usercard.preview();

        // Feed preview show response from current entity
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
        // Card preview show responses list
        cy.get("#childs-div").should('not.be.empty');
        // Response table has 1 header and 1 row 
        cy.get("#childs-div").find('tr').should('have.length', 2);
        // Publisher of child card is set by the template 
        cy.get("#childs-div").find('tr').eq(1).find('td').eq(0).contains('Control Center FR South');
        usercard.sendCard();

        
        feed.openFirstCard();
        card.modifyResponse();

        card.sendResponse();

        // Check the popup for the entities choice is displayed
        cy.get('#opfab-card-details-entities-choice-selector').should('exist');
        cy.get('#opfab-card-details-entities-choice-selector').find('.vscomp-option-text').should('have.length', 4);
        

        cy.get('#opfab-card-details-entity-choice-btn-cancel').click();

        cy.get('#resp_message').invoke('val', 'Cypress test for response publisher');
        card.sendResponse();

        //Response was sent without showing popup for the entities choice
        //Response is updated
        cy.get('#childs-div').find('tr').should('have.length', 2);
        cy.get('#childs-div').find('td')
        .first()
        .should('have.text', ' Control Center FR South ')
        .next()
        .should('have.text', ' YES ')
        .next()
        .should('have.text', ' Cypress test for response publisher ');
    });
});
