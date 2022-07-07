/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab real time users page */

describe ('RealTimeUsersPage',()=>{

    before('Set up configuration', function () {
        cy.loadRealTimeScreensConf();
        cy.deleteAllSettings();
    });

    it('Connection of admin and check of Real time users screen : no one should be connected', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        // we should have 19 disconnected entities/groups and 0 connected
        cy.get('.badge').should('have.length', 19);
        cy.get('.bg-success').should('have.length', 0);
        cy.get('.bg-danger').should('have.length', 19);
    })

    it('Connection of operator3_fr and check of Real time users screen', ()=> {
        cy.loginOpFab('operator3_fr', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        // we should have 18 disconnected entities/groups and 1 connected (operator3_fr for ENTITY3_FR/Dispatcher)
        // we check the connected badge is for the third row/first column
        cy.get('.badge').should('have.length', 19);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 18);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', '(operator3_fr)');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('select').select('French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');
    })

    it('Connection of operator2_fr, which is not in the ADMIN group, and check Real time users screen is authorized and screen is ok', ()=> {
        cy.loginOpFab('operator2_fr', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        // we should have 18 disconnected entities/groups and 1 connected (operator2_fr for ENTITY2_FR/Planner)
        // we check the connected badge is for the second row/second column
        cy.get('.badge').should('have.length', 19);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 18);
        cy.get('table').first().find('tr').eq(2).find('td').eq(1).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(1).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(1).should('contain.text', '(operator2_fr)');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('select').select('French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');
    })

    it('Connection of operator4_fr, which is connected to ENTITY1_FR, ENTITY2_FR, ENTITY3_FR, ENTITY4_FR, ' +
        'interact with activity area screen and check Real time users screen is updated', ()=> {
        cy.loginOpFab('operator4_fr', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        // we should have 15 disconnected entities/groups and 4 connected (operator4_fr for ENTITY1_FR/Dispatcher, ENTITY2_FR/Dispatcher, ENTITY3_FR/Dispatcher and ENTITY4_FR/Dispatcher)
        cy.get('.badge').should('have.length', 19);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 15);

        // we check the connected badges
        // first row/first column
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // second row/first column
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // third row/first column
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // fourth row/first column
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).should('contain.text', '(operator4_fr)');

        // we choose another screen (French Control Centers screen) and we check the titles
        cy.get('#of-realtimeusers-screen-selector').find('select').select('French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(0).find('span').eq(0).should('have.text', 'French Control Centers');
        cy.get('.opfab-realtimeusers-entitiesgroups').eq(1).find('span').eq(0).should('have.text', 'Central Supervision Centers');

        // we should have 5 disconnected entities/groups and 4 connected (operator4_fr for ENTITY1_FR/Dispatcher, ENTITY2_FR/Dispatcher, ENTITY3_FR/Dispatcher and ENTITY4_FR/Dispatcher)
        cy.get('.badge').should('have.length', 9);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 5);

        // operator4_fr disconnect from ENTITY2_FR, ENTITY3_FR and ENTITY4_FR
        cy.openActivityArea();

        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        cy.saveActivityAreaModifications();

        // we go back to the real time screen
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').should('exist').click();

        // we are on the French control centers
        // we should have 8 disconnected entities/groups and 1 connected (operator4_fr for ENTITY1_FR/Dispatcher only)
        cy.get('.badge').should('have.length', 9);
        cy.get('.bg-success').should('have.length', 1);
        cy.get('.bg-danger').should('have.length', 8);

        // we check the connected/disconnected badges
        // first row/first column
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // second row/first column
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', '');
        // third row/first column
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', '');
        // fourth row/first column
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('.bg-danger').should('have.length', 1);
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('span').eq(0).should('have.text', '0');
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).should('contain.text', '');

        // operator4_fr reconnect to ENTITY2_FR, ENTITY3_FR and ENTITY4_FR
        cy.openActivityArea();

        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('not.be.checked');

        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        cy.saveActivityAreaModifications();

        // we go back to the real time screen
        cy.get('#opfab-navbar-drop-user-menu').should('exist').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').should('exist').click();

        // we are on the French control centers
        // we should have 5 disconnected entities/groups and 4 connected (operator4_fr for ENTITY1_FR/Dispatcher, ENTITY2_FR/Dispatcher, ENTITY3_FR/Dispatcher and ENTITY4_FR/Dispatcher )
        cy.get('.badge').should('have.length', 9);
        cy.get('.bg-success').should('have.length', 4);
        cy.get('.bg-danger').should('have.length', 5);

        // we check the connected/disconnected badges
        // first row/first column
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(1).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // second row/first column
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(2).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // third row/first column
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(3).find('td').eq(0).should('contain.text', '(operator4_fr)');
        // fourth row/first column
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('.bg-success').should('have.length', 1);
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).find('span').eq(0).should('have.text', '1 ');
        cy.get('table').first().find('tr').eq(4).find('td').eq(0).should('contain.text', '(operator4_fr)');
    })


    it ('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived ', function () {
        cy.delayRequestResponse('/businessconfig/realtimescreens');

        cy.loginOpFab('operator1_fr','test');

        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        cy.checkLoadingSpinnerIsDisplayed();
        cy.checkLoadingSpinnerIsNotDisplayed();
    })
})