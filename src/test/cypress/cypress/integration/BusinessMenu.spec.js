/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {FeedCommands} from '../support/feedCommands';
import {ScriptCommands} from '../support/scriptCommands';

describe('Business menu', () => {
    const opfab = new OpfabGeneralCommands();
    const feed = new FeedCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.loadTestConf();
        script.deleteAllCards();
        script.sendCard('defaultProcess/chart.json');
    });

    it('Test business menu links in night mode ', 
    {
        retries: {
            runMode: 2, // to avoid flaky test 
            openMode: 1
        }
    },() => {
        opfab.loginWithUser('operator1_fr');

        feed.openFirstCard();
        clickLinkInsideCard();
        opfab.checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?search=chart&fulltext=1&opfab_theme=NIGHT');

        openBusinessDropdownMenu();
        checkDropdownMenuIconLinks('NIGHT');
        closeBusinessDropdownMenu();
        openBusinessDropdownMenu();
        clickOnDropdownMenuEntryNumber(1);
        opfab.checkUrlDisplayedIs('https://opfab.github.io/?opfab_theme=NIGHT');
        openBusinessDropdownMenu();
        clickOnDropdownMenuEntryNumber(2);
        opfab.checkUrlDisplayedIs('https://www.wikipedia.org/?opfab_theme=NIGHT');
        openBusinessDropdownMenu();
        clickOnDropdownMenuEntryNumber(3);
        opfab.checkUrlDisplayedIs('http://localhost:2002/external/appExample/?opfab_theme=NIGHT');

        openBusinessSingleMenu();
        checkSingleMenuIconLink('NIGHT');
        opfab.checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=NIGHT');
    });

    it(
        'Test business menu links in day mode ',
        {
            retries: {
                runMode: 2, // to avoid flaky test 
                openMode: 1
            }
        },
        () => {
            opfab.loginWithUser('operator1_fr');
            opfab.switchToDayMode();

            feed.openFirstCard();
            clickLinkInsideCard();
            opfab.checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?search=chart&fulltext=1&opfab_theme=DAY');

            openBusinessDropdownMenu();
            checkDropdownMenuIconLinks('DAY');
            closeBusinessDropdownMenu();
            openBusinessDropdownMenu();

            clickOnDropdownMenuEntryNumber(1);
            opfab.checkUrlDisplayedIs('https://opfab.github.io/?opfab_theme=DAY');
            openBusinessDropdownMenu();
            clickOnDropdownMenuEntryNumber(2);
            opfab.checkUrlDisplayedIs('https://www.wikipedia.org/?opfab_theme=DAY');
            openBusinessDropdownMenu();
            clickOnDropdownMenuEntryNumber(3);
            opfab.checkUrlDisplayedIs('http://localhost:2002/external/appExample/?opfab_theme=DAY');

            openBusinessSingleMenu();
            checkSingleMenuIconLink('DAY');
            opfab.checkUrlDisplayedIs('https://en.wikipedia.org/w/index.php?opfab_theme=DAY');
        }
    );

    function clickLinkInsideCard() {
        cy.get('#opfab-div-card-template-processed').find('a').eq(0).click();
    }

    function openBusinessDropdownMenu() {
        cy.get('#opfab-navbar-menu-dropdown-menu2').trigger('mouseenter');
    }

    function closeBusinessDropdownMenu() {
        cy.get('#opfab-navbar-menu-dropdown-menu2').trigger('mouseleave');
        cy.get('.text-link').should('have.length', 1);
    }

    function checkDropdownMenuIconLinks(theme) {
        cy.get('.icon-link').eq(1).invoke('attr', 'href').should('eq', 'https://opfab.github.io/?opfab_theme=' + theme);
        cy.get('.icon-link').eq(2).invoke('attr', 'href').should('eq', 'https://www.wikipedia.org/?opfab_theme=' + theme);
        cy.get('.icon-link').eq(3).invoke('attr', 'href').should('eq', 'http://localhost:2002/external/appExample/?opfab_theme=' + theme);
    }

    function clickOnDropdownMenuEntryNumber(menuNumber) {
        cy.get('.text-link').eq(menuNumber).click();
    }

    function checkSingleMenuIconLink(theme) {
        cy.get('.icon-link').eq(0).invoke('attr', 'href').should('eq', 'https://en.wikipedia.org/w/index.php?opfab_theme=' + theme);
    }

    function openBusinessSingleMenu() {
        cy.get('#opfab-navbar-menu-menu1').click();
    }
});
