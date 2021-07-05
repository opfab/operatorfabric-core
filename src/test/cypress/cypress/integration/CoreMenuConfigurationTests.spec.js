/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Core menu configuration tests',function () {

    // These arrays lists all existing core menus, with their id and the selector to use to check for the presence of the link
    
    // The #opfab-navbarContent in selector is to make sure we're targeting the standard navbar links and not the collapsed navbar links
    const navbarMenuItems = [
        {menu_id: "feed", selector: "#opfab-navbarContent #opfab-navbar-menu-feed"},
        {menu_id: "archives", selector: "#opfab-navbarContent #opfab-navbar-menu-archives"},
        {menu_id: "monitoring", selector: "#opfab-navbarContent #opfab-navbar-menu-monitoring"},
        {menu_id: "logging", selector: "#opfab-navbarContent #opfab-navbar-menu-logging"},
        {menu_id: "usercard", selector: ".opfab-menu-icon-newcard"},
        {menu_id: "calendar", selector: ".opfab-menu-icon-calendar"}
    ];

    // The menus that are accessible via the dropdown menu under the user icon on the right are listed separately as
    // it is necessary to open the menu first before checking their presence
    const userMenuItems = [
        {menu_id: "admin", selector: "#opfab-navbar-right-menu-admin"},
        {menu_id: "settings", selector: "#opfab-navbar-right-menu-settings"},
        {menu_id: "feedconfiguration", selector: "#opfab-navbar-right-menu-feedconfiguration"},
        {menu_id: "realtimeusers", selector: "#opfab-navbar-right-menu-realtimeusers"},
        {menu_id: "nightdaymode", selector: "#opfab-navbar-right-menu-night-mode, #opfab-navbar-right-menu-day-mode"},
        {menu_id: "about", selector: "#opfab-navbar-right-menu-about"},
        {menu_id: "logout", selector: "#opfab-navbar-right-menu-logout"}
    ];

    const allMenuItems = navbarMenuItems.concat(userMenuItems);

    const users = ['admin','operator1'];

    //TODO Check collapsed navbar as well

    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    beforeEach('Reset UI configuration file ', function () {
        cy.resetUIConfigurationFiles();
    })

    // Testing all menus for "normal" cases

    describe('Check behaviour if not defined', function () {
        // If core menu is not defined in ui-menu.json, menu should not be visible (for any user)

        users.forEach((user) => {

            it('Menu should not be visible for ' + user, ()=>{

                cy.loginOpFab(user,'test');

                allMenuItems.forEach((item) => {
                    cy.deleteCoreMenuFromConf(item.menu_id); // Remove menu item with given id from ui-menu.json
                    // Reload and check was initially performed after each update rather than globally to make sure that
                    // there was no interference between menus (for example if a menu was linked to another menus configuration by mistake)
                    // Unfortunately it made the tests too long.
                })

                cy.reload();

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })


            })
        })

    })

    describe('Check behaviour if menu is defined and visibility is false', function () {
        // If visibility is false, menu should not be visible (for any user)

        users.forEach((user) => {

            it('Menu should not be visible for ' + user, ()=>{

                cy.loginOpFab(user,'test');

                allMenuItems.forEach((item) => {
                    cy.updateCoreMenuInConf(item.menu_id,"visible",false);
                })

                cy.reload();

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

            })
        })

    })

    describe('Check behaviour if defined and visibility is true and showOnlyForGroups is not set', function () {
        // If core menu is defined with visibility true and showOnlyForGroups not defined, menu should be visible for all users

        users.forEach((user) => {

            it('Menu should be visible for ' + user, ()=>{

                cy.loginOpFab(user,'test');

                allMenuItems.forEach((item) => {
                    cy.deleteCoreMenuFromConf(item.menu_id); // Remove menu item with given id from ui-menu.json
                    cy.updateCoreMenuInConf(item.menu_id,"visible",true);
                })

                cy.reload();

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is not present
                })

            })
        })

    })

    describe('Check behaviour if defined and visibility is true and showOnlyForGroups is set to ["ADMIN"]', function () {
        // If core menu is defined with visibility true and showOnlyForGroups not defined, menu should be visible for all users

        it('Menu should be visible for admin', ()=>{

            cy.loginOpFab('admin','test');

            allMenuItems.forEach((item) => {
                cy.updateCoreMenuInConf(item.menu_id,"visible",true);
                cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            })

            cy.reload();

            navbarMenuItems.forEach((item) => {
                cy.get(item.selector).should('exist');
            })

            cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
            userMenuItems.forEach((item) => {
                cy.get(item.selector).should('exist'); // Check that the corresponding element is not present
            })

        })

        it('Menu should be not be visible for operator1', ()=>{

            cy.loginOpFab('operator1','test');

            allMenuItems.forEach((item) => {
                cy.updateCoreMenuInConf(item.menu_id,"visible",true);
                cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            })

            cy.reload();

            navbarMenuItems.forEach((item) => {
                cy.get(item.selector).should('not.exist');
            })

            cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
            userMenuItems.forEach((item) => {
                cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
            })

        })

    })

    // Testing single menu for "edge" cases

    describe('Check behaviour for edge cases', function () {

        const item = navbarMenuItems[0];

        it('Tests with admin', ()=>{

            cy.loginOpFab('admin','test');

            cy.log('Testing visible: true and showOnlyForGroups: []')
            cy.updateCoreMenuInConf(item.menu_id,"visible",true);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups","[]");
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: true and showOnlyForGroups: null')
            cy.updateCoreMenuInConf(item.menu_id,"visible",true);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",null);
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: false and showOnlyForGroups: ["ADMIN"]')
            cy.updateCoreMenuInConf(item.menu_id,"visible",false);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            cy.reload();
            cy.get(item.selector).should('not.exist');

        })

        it('Tests with operator1', ()=>{

            cy.loginOpFab('operator1','test');

            cy.log('Testing visible: true and showOnlyForGroups: []')
            cy.updateCoreMenuInConf(item.menu_id,"visible",true);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups","[]");
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: true and showOnlyForGroups: null')
            cy.updateCoreMenuInConf(item.menu_id,"visible",true);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",null);
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: false and showOnlyForGroups: ["ADMIN"]')
            cy.updateCoreMenuInConf(item.menu_id,"visible",false);
            cy.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            cy.reload();
            cy.get(item.selector).should('not.exist');

        })


    })




})
