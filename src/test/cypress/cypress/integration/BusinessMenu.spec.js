/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab users administration page */

describe ('Business nenu',()=>{

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.sendCard('defaultProcess/chart.json');
    });

    it('Test business menu links', ()=> {

        cy.loginOpFab('operator1_fr', 'test');

        // check link in chart card detail
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            cy.get('of-card-details').find('of-detail');
            cy.get('#opfab-div-card-template').find('a').eq(0).click();
            cy.get('iframe').invoke('attr', 'src').should('eq', 'https://en.wikipedia.org/w/index.php?opfab_theme=NIGHT&search=chart&fulltext=1');
        });

        // Open business dropdown menu
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();

        // Select first dropdown menu
        cy.get('.text-link').eq(1).click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://opfab.github.io/?opfab_theme=NIGHT');

        cy.get('.icon-link').eq(1).invoke('attr', 'href').should('eq', 'https://opfab.github.io/');

        // Select second dropdown menu
        cy.get('.text-link').eq(2).click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://www.wikipedia.org/?opfab_theme=NIGHT');

        cy.get('.icon-link').eq(2).invoke('attr', 'href').should('eq', 'https://www.wikipedia.org/');

        // close dropdown menu by clicking a second time , otherwise the menu keeps open 
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();

        //Click on single business menu 
        cy.get('#opfab-navbar-menu-menu1').click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://en.wikipedia.org/w/index.php?opfab_theme=NIGHT');

        cy.get('.icon-link').eq(0).invoke('attr', 'href').should('eq', 'https://en.wikipedia.org/w/index.php');

        // Go to Feed page
        cy.get('#opfab-navbar-menu-feed').click();

        // Open user dropdown menu
        cy.get('#opfab-navbar-drop_user_menu').click();
        // Switch to Day Mode
        cy.get('#opfab-navbar-right-menu-day-mode').click();


        // check link in chart card detail
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            cy.get('of-card-details').find('of-detail');
            cy.get('#opfab-div-card-template').find('a').eq(0).click();
            cy.get('iframe').invoke('attr', 'src').should('eq', 'https://en.wikipedia.org/w/index.php?opfab_theme=DAY&search=chart&fulltext=1');
        });

        // Open business dropdown menu
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();

        // Select first dropdown menu
        cy.get('.text-link').eq(1).click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://opfab.github.io/?opfab_theme=DAY');

        // Select second dropdown menu
        cy.get('.text-link').eq(2).click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://www.wikipedia.org/?opfab_theme=DAY');
       
        //Click on single business menu 
        cy.get('#opfab-navbar-menu-menu1').click();

        cy.get('iframe').invoke('attr', 'src').should('eq', 'https://en.wikipedia.org/w/index.php?opfab_theme=DAY');

    });
 
})