/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands";
import {ScriptCommands} from "../support/scriptCommands";

describe('GeoMap tests', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    beforeEach('Reset UI configuration file ', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllCards();
    })

    before('Set configuration', function () {
        script.loadTestConf();
        script.deleteAllCards();
    })

    describe('Check enable and disable of the geomap', function () {
        it('geomap disabled -> geomap should not be visible in the feed', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', false);
            opfab.loginWithUser('operator1_fr');
            cy.get('of-map').should('not.be.visible');
        });

        it('geomap enabled -> geomap should be visible in the feed', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            cy.get('of-map').should('be.visible');
        });
    });

    describe('Check enable and disable of the graph on the geomap', function () {
        it('enableGraph disabled -> graph should not be visible on the geomap in the feed', () => {
            script.setPropertyInConf('feed.geomap.enableMap','web-ui', true);
            script.setPropertyInConf('feed.geomap.enableGraph','web-ui', false);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            cy.get('#mapGraph').should('not.exist');
        });

        it('enableGraph enabled -> graph should be visible on the geomap in the feed', () => {
            script.setPropertyInConf('feed.geomap.enableMap','web-ui', true);
            script.setPropertyInConf('feed.geomap.enableGraph','web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            cy.get('#mapGraph').should('exist');
        });
    });

    describe('Check if points are shown on the geomap', function () {
        it('Card with point data is pointed on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-point_card1"]').find('em.fa.fa-location-crosshairs').click();
            cy.wait(3000);
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-point_card1"]').should('have.length', 2);
        });

        it('Card without point data is not pointed on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/message1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-message1"]').find('em.fa.fa-location-crosshairs').should('not.exist');
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-message1"]').should('have.length', 1);
        });

        it('Card with invalid point data is not pointed on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/invalid_point_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_point_card1"]').find('em.fa.fa-location-crosshairs').click();
            cy.wait(3000);
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_point_card1"]').should('have.length', 1);
        });
    });

    describe('Check if polygon points are shown on the geomap', function () {
        it('Card with polygon data is drawn on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/polygon_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-polygon_card1"]').find('em.fa.fa-location-crosshairs').click();
            cy.wait(3000);
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-polygon_card1"]').should('have.length', 2);
        });

        it('Card without polygon data is not pointed on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/message1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-message1"]').find('em.fa.fa-location-crosshairs').should('not.exist');
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-message1"]').should('have.length', 1);
        });

        it('Card with invalid polygon data is not pointed on the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/invalid_polygon_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_polygon_card1"]').find('em.fa.fa-location-crosshairs').click();
            cy.wait(3000);
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_polygon_card1"]').should('have.length', 1);
        });
    });

    describe('Check if crosshair icon is only visible on cards with a geo-location', function () {
        it('Card with geo-location data should have the crosshair icon', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-point_card1"]').find('em.fa.fa-location-crosshairs').should('exist');
        });

        it('Card without geo-location data should not have the crosshair icon', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/message1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-message1"]').find('em.fa.fa-location-crosshairs').should('not.exist');
        });

        it('Card with invalid geo-location data shoudl have the crosshair icon', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/invalid_point_card1.json');
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_point_card1"]').find('em.fa.fa-location-crosshairs').should('exist');
        })
    });

    describe('Check if map updates correctly with new cards', function () {
        it('A new card with point data should be visible in the geomap', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            script.sendCard('cypress/geoMap/point_card2.json');
            script.sendCard('cypress/geoMap/message1.json');
            cy.wait(3000);
            script.sendCard('cypress/geoMap/point_card3.json');
            cy.wait(2000);
            cy.get('[id^="opfab-feed-light-card-cypress-point_card3"]').find('em.fa.fa-location-crosshairs').click();
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-point_card3"]').should('have.length', 2);
        });

        it('A new card with invalid geo-location data should not be visible on the geomap, but should be visible in the card feed', () => {
            script.setPropertyInConf('feed.geomap.enableMap', 'web-ui', true);
            opfab.loginWithUser('operator1_fr');
            script.sendCard('cypress/geoMap/point_card1.json');
            script.sendCard('cypress/geoMap/point_card2.json');
            cy.wait(3000);
            script.sendCard('cypress/geoMap/invalid_polygon_card1.json');
            cy.wait(2000);
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_polygon_card1"]').find('em.fa.fa-location-crosshairs').click();
            cy.get('of-map').click();
            cy.get('[id^="opfab-feed-light-card-cypress-invalid_polygon_card1"]').should('have.length', 1);
        });
    });

})
