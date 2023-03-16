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
import {AgGridCommands} from "../support/agGridCommands";
import {UserCardCommands} from "../support/userCardCommands"
import {CardCommands} from "../support/cardCommands"
import {FeedCommands} from '../support/feedCommands'

describe ('User action logs page',()=>{

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const agGrid = new AgGridCommands();
    const usercard = new UserCardCommands();
    const card = new CardCommands();
    const feed = new FeedCommands();


    before('Set up configuration', function () {
        script.loadTestConf();
        script.deleteAllUserActionLogs();
        script.deleteAllCards();
        script.deleteAllSettings();
    });



    it('Check logs ', ()=> {

        opfab.loginWithUser('operator1_fr');

        //Do some actions that will be traced in user action logs (Send, read, ack cards, respond to card )
        sendQuestionCard();
        cy.waitDefaultTime();
        sendMessageCard();
        cy.waitDefaultTime();
        opfab.logout();
        cy.waitDefaultTime();
        opfab.loginWithUser('operator2_fr');
        feed.checkNumberOfDisplayedCardsIs(2);
        feed.openFirstCard();
        card.acknowledge();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        feed.openFirstCard();
        cy.get('#response').type('Response');
        card.sendResponse();
        cy.waitDefaultTime();
        feed.toggleFilterByAcknowledgementNotAck();
        feed.toggleFilterByAcknowledgementAck();
        feed.checkNumberOfDisplayedCardsIs(1);
        feed.openFirstCard();
        card.unacknowledge();

        //check Logs menu is not available for non admin user
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-logs').should('not.exist');

        //logout
        cy.get('#opfab-navbar-right-menu-logout').click();

        cy.waitDefaultTime();
        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();

        cy.get('#opfab-useractionlogs-btn-search').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12');

        agGrid.countTableRows('#opfab-useractionlogs-table-grid', 10);

        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', 'admin');

        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'CLOSE_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'have.text', 'operator2_fr');

        agGrid.cellShould('ag-grid-angular', 2, 1, 'have.text', 'UNACK_CARD');
        agGrid.cellShould('ag-grid-angular', 2, 2, 'have.text', 'operator2_fr'); 

        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'SEND_RESPONSE');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'operator2_fr'); 

        agGrid.cellShould('ag-grid-angular', 4, 1, 'have.text', 'READ_CARD');
        agGrid.cellShould('ag-grid-angular', 4, 2, 'have.text', 'operator2_fr');   

        agGrid.cellShould('ag-grid-angular', 5, 1, 'have.text', 'ACK_CARD');
        agGrid.cellShould('ag-grid-angular', 5, 2, 'have.text', 'operator2_fr'); 

        agGrid.cellShould('ag-grid-angular', 6, 1, 'have.text', 'READ_CARD');
        agGrid.cellShould('ag-grid-angular', 6, 2, 'have.text', 'operator2_fr');      

        agGrid.cellShould('ag-grid-angular', 7, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 7, 2, 'have.text', 'operator2_fr');

        agGrid.cellShould('ag-grid-angular', 8, 1, 'have.text', 'CLOSE_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 8, 2, 'have.text', 'operator1_fr');

        agGrid.cellShould('ag-grid-angular', 9, 1, 'have.text', 'SEND_CARD');
        agGrid.cellShould('ag-grid-angular', 9, 2, 'have.text', 'operator1_fr');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('#opfab-useractionlogs-table-grid', 2);

        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'SEND_CARD');
        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', 'operator1_fr');

        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'have.text', 'operator1_fr');




        selectUsername(['operator1_fr','operator2_fr']);
        selectAction(['SEND_CARD','READ_CARD']);
        cy.get('#opfab-useractionlogs-btn-search').click();
        agGrid.countTableRows('#opfab-useractionlogs-table-grid', 4);

        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'READ_CARD');
        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', 'operator2_fr');

        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'READ_CARD');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'have.text', 'operator2_fr');

        agGrid.cellShould('ag-grid-angular', 2, 1, 'have.text', 'SEND_CARD');
        agGrid.cellShould('ag-grid-angular', 2, 2, 'have.text', 'operator1_fr');

        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'SEND_CARD');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'operator1_fr');

        cy.get('#opfab-useractionlogs-btn-reset').click();
        cy.get('#opfab-useractionlogs-table-grid').should('not.exist');
        
        selectUsername(['operator3_fr']);
        cy.get('#opfab-useractionlogs-btn-search').click();
        cy.get('#opfab-useractionlogs-noResult').contains('Your search did not match any result.');
    })

    it('Check card details ', ()=> {

        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();

        cy.get('#opfab-useractionlogs-btn-search').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        agGrid.countTableRows('#opfab-useractionlogs-table-grid', 10);

        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', 'admin');

        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'CLOSE_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'have.text', 'admin');

        agGrid.cellShould('ag-grid-angular', 2, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 2, 2, 'have.text', 'admin');

        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'CLOSE_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'operator2_fr');

        agGrid.cellShould('ag-grid-angular', 4, 1, 'have.text', 'UNACK_CARD');
        agGrid.cellShould('ag-grid-angular', 4, 2, 'have.text', 'operator2_fr'); 

        agGrid.cellShould('ag-grid-angular', 5, 1, 'have.text', 'SEND_RESPONSE');
        agGrid.cellShould('ag-grid-angular', 5, 2, 'have.text', 'operator2_fr'); 

        agGrid.cellShould('ag-grid-angular', 6, 1, 'have.text', 'READ_CARD');
        agGrid.cellShould('ag-grid-angular', 6, 2, 'have.text', 'operator2_fr');
        
        agGrid.clickCell('ag-grid-angular', 0, 1);
        cy.get('of-archived-card-detail').should('not.exist');

        agGrid.clickCell('ag-grid-angular', 4, 1);
        cy.get('of-simplified-card-view').should('exist');

        //Close detail
        cy.get('#opfab-archives-card-detail-close').click({force: true});
        cy.get('of-archived-card-detail').should('not.exist');

        agGrid.clickCell('ag-grid-angular', 5, 1);
        cy.get('of-simplified-card-view').should('exist');
        // Check the response has been integrated in the template
        cy.get('#childs-div').find('tr').should('have.length', 2);


    });

    it('View as itsupervisor with permission VIEW_USER_ACTION_LOGS', ()=> {

        opfab.loginWithUser('itsupervisor1');
        opfab.navigateToUserActionLogs();


        cy.get('#opfab-useractionlogs-btn-search').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 16');
        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'OPEN_SUBSCRIPTION');
        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', 'itsupervisor1');
    })


    function sendQuestionCard() {
        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Message or question');
        usercard.selectState('Question');
        cy.get('#label').should('have.text',' QUESTION ');
        cy.get('#question').type('First question');
        usercard.selectRecipient('Control Center FR South');
        usercard.previewThenSendCard();
    }
    
    function sendMessageCard() {
        opfab.navigateToUserCard();
        // Send base example message
        usercard.selectRecipient('Control Center FR South');
        usercard.previewThenSendCard();
    }

    function selectUsername(logins) {
        cy.get('#opfab-login-filter').click();
        logins.forEach(login => {
            cy.get('#opfab-login-filter').find('.vscomp-option-text').contains(login).eq(0).click({force: true});
        });
    }

    function selectAction(actions) {
        cy.get('#opfab-action-filter').click();
        actions.forEach(action => {
            cy.get('#opfab-action-filter').find('.vscomp-option-text').contains(action).eq(0).click({force: true});
        });
    }
})