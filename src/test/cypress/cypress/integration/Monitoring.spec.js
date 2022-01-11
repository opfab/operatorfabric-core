/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Monitoring screen tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.send6TestCards();
    });


    it('Check composition of multi-filters for process groups/processes/type of state for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for itsupervisor1', function () {
        cy.loginOpFab('itsupervisor1', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for admin', function () {
        cy.loginOpFab('admin', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check the 3 multi-filters for service/process/type of state do not exist
        cy.get('#opfab-processGroup').should('not.exist');
        cy.get('#opfab-process').should('not.exist');
        cy.get('#opfab-typeOfState').should('not.exist');

        cy.get('#opfab-monitoring-no-process-state-available').should('exist');
        cy.get('#opfab-monitoring-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check composition of multi-filters for processes/states/typeOfState for operator1_fr, with a config without process group', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').should('not.exist');

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');

        cy.loadTestConf();
        cy.reload();
    })



    it('Check monitoring cards reception', function () {

        cy.loginOpFab('operator1_fr','test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // operator1_fr should see the grid of monitoring cards
        cy.get("#opfab-monitoring-table").find('#opfab-monitoring-table-grid').should("exist");

        // No card detail is displayed
        cy.get('of-card-details').should('not.exist');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 5);

        // Opens the first card, checks that its content is visible
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').first().click();
        cy.get('of-card-details').first().should('exist');

        // Closes the card content and check card  body is no longer visible
        cy.get("#opfab-close-card").click();
        cy.get('of-card-details').should('not.exist');
    })
    

    it('Check filters and reset button', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 5);

        // Filter on IN PROGRESS cards
        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').find('li').first().click();

        // Press search button to apply the filter
        cy.get('#opfab-monitoring-btn-search').click();

        // Should have the correct number of cards (3 because 3 are IN PROGRESS)
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3);

        // All found cards should be IN PROGRESS
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container')
                                              .find('.ag-row')
                                              .find(".opfab-typeOfState-INPROGRESS")
                                              .should('have.length', 3);

        
        // Reset displayed cards
        cy.get('#opfab-monitoring-btn-reset').should("exist");
        cy.get('#opfab-monitoring-btn-reset').click();

        // The grid containing monitoring cards should have been reset
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 5);


        // Use a filter that will not return any card
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        cy.get('#opfab-processGroup').find('.lazyContainer > li').eq(1).click();

        // Press search button to apply the filter
        cy.get('#opfab-monitoring-btn-search').click();

        // No card should be displayed
        cy.get('#opfab-monitoring-table-grid').should('not.exist');

        // A text saying no result was found should be displayed
        cy.get('#opfab-monitoring-noResult').should('exist');


    })

    it('Check title sort', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('@monitoring-table').find('.ag-row').should('have.length', 5);


        // Sorting titles a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(3).click();
        cy.wait(500);

        // Cards should fe sorted by title
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(3).should('have.text', 'Electricity consumption forecast');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(3).should('have.text', 'Message');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(3).should('have.text', 'Process state (calcul)');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(3).should('have.text', '⚠️ Network Contingencies ⚠️');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(3).should('have.text', '⚡ Planned Outage');

        // Sorting titles a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(3).click();
        cy.wait(500);

        // Cards should fe sorted by title
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(3).should('have.text', '⚡ Planned Outage');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(3).should('have.text', '⚠️ Network Contingencies ⚠️');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(3).should('have.text', 'Process state (calcul)');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(3).should('have.text', 'Message');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(3).should('have.text', 'Electricity consumption forecast');

    })

    it('Check summary sort', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('@monitoring-table').find('.ag-row').should('have.length', 5);


        // Sorting summaries a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(4).click();
        cy.wait(500);

        // Cards should fe sorted by summary
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(4).should('have.text', 'Contingencies report for French network');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(4).should('have.text', 'Message received');
        
        // Sorting summaries a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(4).click();
        cy.wait(500);

        // Cards should fe sorted by summary
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(4).should('have.text', 'Message received');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(4).should('have.text', 'Contingencies report for French network');

    })

    it('Check process state sort', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('@monitoring-table').find('.ag-row').should('have.length', 5);


        // Sorting process states a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(5).click();
        cy.wait(500);

        // Cards should fe sorted by process states
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(5).should('have.text', 'CANCELED');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(5).should('have.text', 'FINISHED');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        
        // Sorting process states a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(5).click();
        cy.wait(500);

        // Cards should fe sorted by process states
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(5).should('have.text', 'IN PROGRESS');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(5).should('have.text', 'FINISHED');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(5).should('have.text', 'CANCELED');

    })

    it('Check emitter sort', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('@monitoring-table').find('.ag-row').should('have.length', 5);


        // Sorting emitters a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(6).click();
        cy.wait(500);

        // Cards should fe sorted by emitter
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(6).should('have.text', 'Control Center FR North (publisher_test)');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        
        // Sorting emitters a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(6).click();
        cy.wait(500);

        // Cards should fe sorted by emitter
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(6).should('have.text', 'publisher_test');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(6).should('have.text', 'Control Center FR North (publisher_test)');

    })

    it('Check answer sort', function () {

        cy.loginOpFab('operator1_fr','test');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        cy.get('@monitoring-table').find('.ag-row').should('have.length', 5);


        // Sorting answers a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(7).click();
        cy.wait(500);

        // Cards should fe sorted by answer
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(7).should('contain.text', 'Control Center FR East').should('contain.text', 'Control Center FR North');
        

        // Sorting answers a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(7).click();
        cy.wait(500);

        // Cards should fe sorted by emitter
        cy.get('@monitoring-table').find('.ag-row').eq(0).find('.ag-cell').eq(7).should('contain.text', 'Control Center FR East').should('contain.text', 'Control Center FR North');
        cy.get('@monitoring-table').find('.ag-row').eq(1).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(2).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(3).find('.ag-cell').eq(7).should('have.text', '');
        cy.get('@monitoring-table').find('.ag-row').eq(4).find('.ag-cell').eq(7).should('have.text', '');

    })

})
