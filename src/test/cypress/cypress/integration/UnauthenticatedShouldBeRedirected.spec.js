/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const featureUrls = [
    '#/feed/cards',
    '#/archives',
    '#/monitoring',
    '#/logging',
    '#/businessconfigparty/menu1/uid_test_0',
    '#/feed/cards',
    '#/calendar',
    '#/admin',
    '#/settings',
    '#/feedconfiguration',
    '#/someotherpathsthatdoestexist'
]

describe ('Unauthenticated user should be redirected',()=>{

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFile();

    });

    //If attempting to access app pages, an unauthenticated user should be redirected to the feed page and it should
    //display the login component

    featureUrls.forEach((url) => {
        it('Unauthenticated attempt to access url ' + url, ()=>{

            cy.visit(url)

            //Check that the browser has been redirected to the feed page
            cy.hash().should('eq', '#/feed')

            //Check that it is showing the login component
            cy.get('#opfab-login').should('be.visible')

        })
    })

})