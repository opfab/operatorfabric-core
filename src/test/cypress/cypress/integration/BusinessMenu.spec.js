/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getOpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {getFeedCommands} from '../support/feedCommands'

describe ('Business nenu',()=>{

    const opfab = getOpfabGeneralCommands();
    const feed = getFeedCommands();

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.sendCard('defaultProcess/chart.json');
    });

    it('Test business menu links in night mode ', ()=> {

        opfab.loginWithUser('operator1_fr');

        feed.openFirstCard();
        clickLinkInsideCard();
        checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=NIGHT&search=chart&fulltext=1');
 
        openBusinessDropdownMenu();
        checkDropdownMenuIconLinks();
        clickOnDropdownMenuEntryNumber(1);
        checkUrlDisplayedIs('https://opfab.github.io/?opfab_theme=NIGHT');
        clickOnDropdownMenuEntryNumber(2);
        checkUrlDisplayedIs('https://www.wikipedia.org/?opfab_theme=NIGHT');
        clickOnDropdownMenuEntryNumber(3);
        checkUrlDisplayedIs('http://localhost:2002/external/appExample/?opfab_theme=NIGHT');

        openBusinessSingleMenu();
        checkSingleMenuIconLink();
        checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=NIGHT');

    });

    it('Test business menu links in day mode ', ()=> {

        opfab.loginWithUser('operator1_fr')
        opfab.switchToDayMode();

        feed.openFirstCard();
        clickLinkInsideCard();
        checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=DAY&search=chart&fulltext=1');

        openBusinessDropdownMenu();
        clickOnDropdownMenuEntryNumber(1);
        checkUrlDisplayedIs('https://opfab.github.io/?opfab_theme=DAY');
        clickOnDropdownMenuEntryNumber(2);
        checkUrlDisplayedIs('https://www.wikipedia.org/?opfab_theme=DAY');
        clickOnDropdownMenuEntryNumber(3);
        checkUrlDisplayedIs('http://localhost:2002/external/appExample/?opfab_theme=DAY');

        openBusinessSingleMenu();
        checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=DAY');

    });

    function clickLinkInsideCard() {
        cy.get('#opfab-div-card-template-processed').find('a').eq(0).click();
    }

    function checkUrlDisplayedIs(url) {
        cy.get('iframe').invoke('attr', 'src').should('eq', url);
    }

    function openBusinessDropdownMenu() {
        cy.get('#opfab-navbar-menu-dropdown-menu2').click();
    }

    function checkDropdownMenuIconLinks() {
        cy.get('.icon-link').eq(1).invoke('attr', 'href').should('eq', 'https://opfab.github.io/');
        cy.get('.icon-link').eq(2).invoke('attr', 'href').should('eq', 'https://www.wikipedia.org/');
        cy.get('.icon-link').eq(3).invoke('attr', 'href').should('eq', 'http://localhost:2002/external/appExample/');
    }

    function clickOnDropdownMenuEntryNumber(menuNumber) {
        cy.get('.text-link').eq(menuNumber).click();
    }

    function checkSingleMenuIconLink() {
        cy.get('.icon-link').eq(0).invoke('attr', 'href').should('eq', 'https://en.wikipedia.org/w/index.php');
    }

    function openBusinessSingleMenu() {
        cy.get('#opfab-navbar-menu-menu1').click();
    }
})