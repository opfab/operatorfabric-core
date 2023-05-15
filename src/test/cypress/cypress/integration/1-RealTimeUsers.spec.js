/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ActivityAreaCommands} from "../support/activityAreaCommands"
import {ScriptCommands} from "../support/scriptCommands";

describe ('RealTimeUsersPage',()=>{

    const opfab = new OpfabGeneralCommands();
    const activityArea = new ActivityAreaCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.loadRealTimeScreensConf();
        script.deleteAllSettings();
    });

    it('Connection of admin and check of Real time users screen : no one should be connected', ()=> {
        opfab.loginWithUser('admin');
        opfab.navigateToRealTimeUsers();

        // we should have 10 disconnected entities and 0 connected
        cy.get('.badge').should('have.length', 10);
        cy.get('.bg-success').should('have.length', 0);
        cy.get('.bg-danger').should('have.length', 10);
    })

    it('Connection of operator3_fr and check of Real time users screen', ()=> {
        opfab.loginWithUser('operator3_fr');
        opfab.navigateToRealTimeUsers();

        // we should have 9 disconnected entities and 1 connected (operator3_fr for ENTITY3_FR)
        // we check the connected badge is for the third row
        cy.get('.badge').should('have.length', 10);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 9);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', 'operator3_fr');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');
    })

    it('Connection of operator2_fr, which is not in the ADMIN group, and check Real time users screen is authorized and screen is ok', ()=> {
        opfab.loginWithUser('operator2_fr');
        opfab.navigateToRealTimeUsers();

        // we should have 9 disconnected entities and 1 connected (operator2_fr for ENTITY2_FR)
        // we check the connected badge is for the second row
        cy.get('.badge').should('have.length', 10);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 9);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', 'operator2_fr');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');
    })

    it('Connection of operator4_fr, which is connected to ENTITY1_FR, ENTITY2_FR, ENTITY3_FR, ENTITY4_FR, ' +
        'interact with activity area screen and check Real time users screen is updated', ()=> {
        opfab.loginWithUser('operator4_fr');
        opfab.navigateToRealTimeUsers();

        // we should have 6 disconnected entities and 4 connected (operator4_fr for ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR)
        cy.get('.badge').should('have.length', 10);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 6);

        // we check the connected badges
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).should('contain.text', 'operator4_fr');
        // second row
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', 'operator4_fr');
        // third row
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', 'operator4_fr');
        // fourth row
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', 'operator4_fr');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');

        // we should have 5 disconnected entities and 4 connected (operator4_fr for ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR)
        cy.get('.badge').should('have.length', 5);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 1);

        // operator4_fr disconnect from ENTITY2_FR, ENTITY3_FR and ENTITY4_FR
        opfab.navigateToActivityArea();
        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        activityArea.clickOnCheckbox('Control Center FR East');
        activityArea.clickOnCheckbox('Control Center FR South');
        activityArea.clickOnCheckbox('Control Center FR West');
        activityArea.save();

    
        // we go back to the real time screen
        // we logout and login to avoid detached dom cypress error
        // when refreshing activity area page due to user config reload
        // receive via the subscription mechanism
        opfab.logout();
        opfab.loginWithUser('operator4_fr');
        opfab.navigateToRealTimeUsers();

        // we are on the French control centers
        // we should have 8 disconnected entities and 1 connected (operator4_fr for ENTITY1_FR only)
        cy.get('.badge').should('have.length', 5);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 4);

        // we check the connected/disconnected badges
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).should('contain.text', 'operator4_fr');
        // second row
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', '');
        // third row
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', '');
        // fourth row
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', '');

        // operator4_fr reconnect to ENTITY2_FR, ENTITY3_FR and ENTITY4_FR
        opfab.navigateToActivityArea();
        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('not.be.checked');
        activityArea.clickOnCheckbox('Control Center FR East');
        activityArea.clickOnCheckbox('Control Center FR South');
        activityArea.clickOnCheckbox('Control Center FR West');
        activityArea.save();

        // we go back to the real time screen
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').should('exist').click();

        // we are on the French control centers
        // we should have 4 connected entities (operator4_fr for ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR)
        cy.get('.badge').should('have.length', 5);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 1);

        // we check the connected/disconnected badges
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(0).find('td').eq(0).should('contain.text', 'operator4_fr');
        // second row
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', 'operator4_fr');
        // third row
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', 'operator4_fr');
        // fourth row
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', 'operator4_fr');
    })

    it ('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived ', function () {
        cy.delayRequestResponse('/businessconfig/realtimescreens');
        opfab.loginWithUser('operator1_fr');
        opfab.navigateToRealTimeUsers();
        opfab.checkLoadingSpinnerIsDisplayed();
        opfab.checkLoadingSpinnerIsNotDisplayed();
    })
})