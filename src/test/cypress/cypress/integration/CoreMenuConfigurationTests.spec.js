/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {OpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe ('Core menu configuration tests',function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    // These arrays list all existing core menus, with their id and the selector to use to check for the presence of the link
    
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
        {menu_id: "settings", selector: "#opfab-navbar-right-menu-settings"},
        {menu_id: "feedconfiguration", selector: "#opfab-navbar-right-menu-feedconfiguration"},
        {menu_id: "realtimeusers", selector: "#opfab-navbar-right-menu-realtimeusers"},
        {menu_id: "nightdaymode", selector: "#opfab-navbar-right-menu-night-mode, #opfab-navbar-right-menu-day-mode"},
        {menu_id: "about", selector: "#opfab-navbar-right-menu-about"},
        {menu_id: "changepassword", selector: "#opfab-navbar-right-menu-change-password"},
        {menu_id: "logout", selector: "#opfab-navbar-right-menu-logout"}
    ];

    const adminMenuItems = [
        {menu_id: "admin", selector: "#opfab-navbar-right-menu-admin"},
        {menu_id: "externaldevicesconfiguration", selector: "#opfab-navbar-right-menu-externaldevicesconfiguration"},
        {menu_id: "useractionlogs", selector: "#opfab-navbar-right-menu-useractionlogs"},

    ];

    const allMenuItems = navbarMenuItems.concat(userMenuItems, adminMenuItems);

    const users = ['admin','operator1_fr'];

    //TODO Check collapsed navbar as well

    before('Set up configuration', function () {
        script.loadTestConf();
    });

    beforeEach('Reset UI configuration file ', function () {
        script.resetUIConfigurationFiles();
    })

    // Testing all menus for "normal" cases

    describe('Check behaviour if not defined', function () {
        // If core menu is not defined in ui-menu.json, menu should not be visible (for any user)

        users.forEach((user) => {

            it('Menu should not be visible for ' + user, ()=>{
                script.configureMenuNotDefined();
                opfab.loginWithUser(user);

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
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
                script.configureMenuNotVisibleForAllUsers();
                opfab.loginWithUser(user);

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

            })
        })

    })
    

    describe('Check behaviour if defined and visibility is true and showOnlyForGroups not set', function () {
        // If core menu is defined with visibility true and showOnlyForGroups not defined, menu should be visible for all users
        it('Menu should be visible for admin' , ()=>{
            script.configureMenuVisibleForAllUsers();


                opfab.loginWithUser('admin');

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is not present
                })
                adminMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is present
                })

        })

        it('Menu should be visible for operator1_fr' , ()=>{
            script.configureMenuVisibleForAllUsers();

                opfab.loginWithUser('operator1_fr');

                navbarMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is present
                })

                cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
                userMenuItems.forEach((item) => {
                    cy.get(item.selector).should('exist'); // Check that the corresponding element is  present
                })
                // Admin menu are not visible because ADMIN permission is needed, even if showOnlyForGroups is not set
                adminMenuItems.forEach((item) => {
                    cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
                })

        })
    })


    describe('Check behaviour if defined and visibility is true and showOnlyForGroups is set to ["ADMIN"]', function () {

        it('Menu should be visible for admin group', ()=>{
            script.configureMenuForAdminGroup();


            opfab.loginWithUser('admin');

            navbarMenuItems.forEach((item) => {
                cy.get(item.selector).should('exist');
            })

            cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
            userMenuItems.forEach((item) => {
                cy.get(item.selector).should('exist'); // Check that the corresponding element is present
            })
            adminMenuItems.forEach((item) => {
                cy.get(item.selector).should('exist'); // Check that the corresponding element is present
            })

        })

        it('Menu should not be visible for operator1_fr', ()=>{
            script.configureMenuForAdminGroup();
            opfab.loginWithUser('operator1_fr');

            navbarMenuItems.forEach((item) => {
                cy.get(item.selector).should('not.exist');
            })

            cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
            userMenuItems.forEach((item) => {
                cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
            })
            adminMenuItems.forEach((item) => {
                cy.get(item.selector).should('not.exist'); // Check that the corresponding element is not present
            })
        })
    })

    describe('Check behaviour of "change password" menu item', function () {

        it('Check url of change password screen is displayed', ()=>{
            script.configureMenuVisibleForAllUsers();
            opfab.loginWithUser('operator1_fr');

            cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
            cy.get('#opfab-navbar-right-menu-change-password').should('exist').click();

            opfab.checkUrlDisplayedIs('http://localhost:89/auth/realms/dev/account/#/security/signingin');
        })
    })

    describe('Check behaviour for edge cases', function () {

        const item = navbarMenuItems[0];    //feed

        it('Tests with admin', ()=>{

            opfab.loginWithUser('admin');

            cy.log('Testing visible: true and showOnlyForGroups: []')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups","[]");
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: true and showOnlyForGroups: null')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",null);
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: showOnlyForGroups: ["ADMIN"]')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            cy.reload();
            cy.get(item.selector).should('exist');

        })

        it('Tests with operator2_fr', ()=>{

            opfab.loginWithUser('operator2_fr');

            cy.log('Testing visible: true and showOnlyForGroups: []')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups","[]");
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: true and showOnlyForGroups: null')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",null);
            cy.reload();
            cy.get(item.selector).should('exist');

            cy.log('Testing visible: showOnlyForGroups: ["ADMIN"]')
            script.updateCoreMenuInConf(item.menu_id,"showOnlyForGroups",'[\\\"ADMIN\\\"]');
            cy.reload();
            cy.get(item.selector).should('not.exist');
        })
    })
})
