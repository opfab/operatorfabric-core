/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Archives screen tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
    });


    it('Check archived cards reception', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr','test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We click the search button
        cy.get('#opfab-archives-btn-search').click();

        // operator1_fr should see 6 archived cards
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        // No plus icon is displayed
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('not.exist');
        // No minus icon is displayed
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').should('not.exist');

        // No card detail is displayed
        cy.get('of-card-detail').should('not.exist');

        // Pagination should display ' Results number  : 6 '
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We delete the test cards and we check that we still have the corresponding archived cards
        cy.deleteAllCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We send again the test cards and we check that the we have 10 lines of archived cards
        // and we check there is no plus or minus icon (because 'collapsible updates' mode is not activated)
        cy.send6TestCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',10);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').should('not.exist');
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 12 ');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});

        // We check that the we have 6 lines of archived cards (6 * 2 instances per card)
        // and we check we have plus icon for each line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});
    })

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We check we have 3 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 3);
        cy.get('#opfab-processGroup').contains('--').should('exist');
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 6 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 6);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 3').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');
        cy.get('#opfab-process').contains('Test process for cypress').should('exist');
        // We select all processes
        cy.get('#opfab-process').contains('Select All').click();
        cy.get('#opfab-process').click();

        // We check we have 27 states (and 6 items for their process)
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 33);
        // We check this state is not present because it is only a child state
        cy.get('#opfab-state').contains('Planned outage date response', {matchCase: false}).should('not.exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for itsupervisor1', function () {
        cy.loginOpFab('itsupervisor1', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 5 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 5);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 3').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');
        // We select all processes
        cy.get('#opfab-process').contains('Select All').click();
        cy.get('#opfab-process').click();

        // We check we have 12 states (and 5 items for their process)
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 17);

        // We unselect all processes then we select 'Process example' process and we check there is only 1 state for this process
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').contains('UnSelect All').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 2);
        cy.get('#opfab-state').contains('Action Required', {matchCase: false}).should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for admin', function () {
        cy.loginOpFab('admin', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We check the 3 multi-filters for service/process/state do not exist
        cy.get('#opfab-processGroup').should('not.exist');
        cy.get('#opfab-process').should('not.exist');
        cy.get('#opfab-state').should('not.exist');

        cy.get('#opfab-archives-no-process-state-available').should('exist');
        cy.get('#opfab-archives-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr, with a config without process group', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We check process groups multi-filter do not exist
        cy.get('#opfab-processGroup').should('not.exist');

        // We check we have 6 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 6);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 3').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');
        cy.get('#opfab-process').contains('Test process for cypress').should('exist');
        // We select all processes
        cy.get('#opfab-process').contains('Select All').click();
        cy.get('#opfab-process').click();

        // We check we have 27 states (and 6 items for their process)
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 33);
        // We check this state is not present because it is only a child state
        cy.get('#opfab-state').contains('Planned outage date response', {matchCase: false}).should('not.exist');

        cy.loadTestConf();
        cy.reload();
    })

    it('Check behaviour of "isOnlyAChildState" attribute (in file config.json of bundles)', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We select all process groups
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We choose the process 'Process example'
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();

        // We check every state is present except 'Planned outage date response' because 'isOnlyAChildState' attribute is set to true for this state
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 8);
        // One list item is for the process 
        cy.get('#opfab-state').contains('Process example').should('exist');
        cy.get('#opfab-state').contains('Message').should('exist');
        cy.get('#opfab-state').contains('A Chart').should('exist');
        cy.get('#opfab-state').contains('Process example').should('exist');
        cy.get('#opfab-state').contains('Electricity consumption forecast').should('exist');
        cy.get('#opfab-state').contains('Action required').should('exist');
        cy.get('#opfab-state').contains('Additional information required').should('exist');
        cy.get('#opfab-state').contains('Network Contingencies').should('exist');
        cy.get('#opfab-state').contains('Planned outage date response', {matchCase: false}).should('not.exist');
    })

    it('Check behaviour of plus/minus icons', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We send again the test cards, we activate the 'collapsible updates' mode and we check that the we have 6 lines of
        // archived cards (6 * 2 instances per card) and we check we have plus icon for each line
        cy.send6TestCards();
        cy.get('#opfab-archives-btn-search').click();

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});

        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ');

        // We click plus icon and we check we see one more archived card for the corresponding line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').first().click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',7);

        // We check there is a minus icon in place of the plus icon
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-minus').should('have.length', 1);

        // We check there is neither plus icon nor minus icon on the additional line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(1).find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(1).find('.opfab-archives-icon-minus').should('not.exist');

        // We click minus icon and we check the additional line disappear
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').first().click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);

        // We check there is a plus icon in place of the minus icon
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-plus').should('have.length', 1);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-minus').should('not.exist');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});
    })
})
