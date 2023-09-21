/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {AgGridCommands} from "../support/agGridCommands";
import {ScriptCommands} from "../support/scriptCommands";

describe('ExternalDevicesconfigurationPage', () => {

    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.loadTestConf();
    });

    it('Enable and disable external devices', () => {
        opfab.loginWithUser('admin');
        opfab.openExternalDevices();

        // Check that the tabs exist
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-users-tab').should('exist');
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-devices-tab').should('exist');

        cy.get('#addItem').should('not.exist');

        agGrid.countTableRows('ag-grid-angular', 3);

        checkNthDeviceIsEnabled(0);
        checkNthDeviceIsEnabled(1);
        checkNthDeviceIsEnabled(2);

        clickOnNthDevice(0);
        clickOnNthDevice(2);

        checkNthDeviceIsDisabled(0);
        checkNthDeviceIsEnabled(1);
        checkNthDeviceIsDisabled(2);

        clickOnNthDevice(2);

        checkNthDeviceIsDisabled(0);
        checkNthDeviceIsEnabled(1);
        checkNthDeviceIsEnabled(2);
        
        // Check that the changes are saved when we change screen
        cy.get('#opfab-navbar-menu-feed').click();
        opfab.openExternalDevices();

        agGrid.countTableRows('ag-grid-angular', 3);

        checkNthDeviceIsDisabled(0);
        checkNthDeviceIsEnabled(1);
        checkNthDeviceIsEnabled(2);

        // Enable CDS_1 to clean test environment
        clickOnNthDevice(0);
    })

    it('List, add, edit, delete user device configuration', () => {
        opfab.loginWithUser('admin');
        opfab.openExternalDevices();

        // Go to the users configuration screen
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-users-tab').click();

        agGrid.countTableRows('#opfab-externaldevices-table-grid', 4);

        // Add new configuration
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        // we choose admin user
        clickOnNthUserInDropdown(0);

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        clickOnNthDeviceInDropdown(0);

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-admin-edit-btn-add').click();

        agGrid.countTableRows('#opfab-externaldevices-table-grid', 5);

        // Edit previously created row
        agGrid.clickCell('#opfab-externaldevices-table-grid', 4, 2, 'of-action-cell-renderer');

        cy.get('of-externaldevices-modal').should('exist');

        // Remove external sound devices and see if save button is disabled
        clickOnNthDeviceInDropdown(0);
        cy.get('#opfab-admin-user-btn-save').should('be.disabled');

        cy.wait(100);
        // Add two external sound devices
        clickOnNthDeviceInDropdown(0);
        cy.wait(100);
        clickOnNthDeviceInDropdown(1);

        // Wait for the dropdown to disappear before clicking save button
        cy.get('#opfab-admin-user-btn-save').should('be.visible').click();

        // Workaround to let ag-grid update the value in dom, otherwise it fails even if the right value is shown on screen
        cy.reload();

        opfab.openExternalDevices();
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-users-tab').click();

        agGrid.cellShould('#opfab-externaldevices-table-grid', 4, 1, 'have.text', 'CDS_1,CDS_2');

        // Delete previously created row
        agGrid.clickCell('#opfab-externaldevices-table-grid', 4, 3, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');
        cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
        agGrid.countTableRows('#opfab-externaldevices-table-grid', 4);
    });

    it('Add device configuration for all available users', () => {
        opfab.loginWithUser('admin');
        opfab.openExternalDevices();

        // Go to the users configuration screen
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-users-tab').click();

        // We iterate 14 times because there are 18 users and 4 users have already a configuration
        for (let i = 0; i < 14; i++) {
            cy.get('#addItem').should('be.visible').click();

            cy.get('of-externaldevices-modal').should('exist');

            clickOnNthUserInDropdown(0);

            clickOnNthDeviceInDropdown(0);

            // Wait for the dropdown to disappear before clicking add button
            cy.get('#opfab-admin-edit-btn-add').should('be.visible').click({force: true});
        }

        //First page is 10 rows
        agGrid.countTableRows('#opfab-externaldevices-table-grid', 10);

        // Pagination should display ' Results number  : 18 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 18');

        // When all users devices are configured it is not possible to add new configurations
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');
        cy.get('#opfab-usersDropdownList').should('not.exist');
        cy.get('of-externaldevices-modal').contains('All users devices are already configured');

        cy.get('#opfab-admin-edit-btn-close').eq(0).click();
    });

    it('Delete added device configurations', () => {
        opfab.loginWithUser('admin');
        opfab.openExternalDevices();

        // Go to the users configuration screen
        cy.get('#opfab-externaldevices-tabs').find('#opfab-externaldevices-users-tab').click();

        cy.get('#opfab-externaldevices-table-grid').should('exist');
        //First page is 10 rows
        agGrid.countTableRows('#opfab-externaldevices-table-grid', 10);

        // Delete previously created configurations
        for (let j = 18; j > 4; j--) {
            agGrid.clickCell('#opfab-externaldevices-table-grid', 4, 3, 'of-action-cell-renderer');

            cy.get('of-confirmation-dialog').should('exist');
            cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
            cy.waitDefaultTime();
        }
        agGrid.countTableRows('#opfab-externaldevices-table-grid', 4);
    });

    function clickOnNthDeviceInDropdown(index) {
        cy.get('#opfab-devicesDropdownList').click();
        cy.get('#opfab-devicesDropdownList').find('.vscomp-option-text').eq(index).click({force: true});
        cy.get('#opfab-devicesDropdownList').click();
    }

    function clickOnNthUserInDropdown(index) {
        cy.get('#opfab-usersDropdownList').click();
        cy.get('#opfab-usersDropdownList').find('.vscomp-option-text').eq(index).click({force: true});
        cy.get('#opfab-usersDropdownList').click();
    }

    function clickOnNthDevice(index) {
        agGrid.clickCell('ag-grid-angular', index, 1, '.opfab-checkbox-checkmark');
    }

    function checkNthDeviceIsEnabled(index) {
        agGrid.cellElementShould('ag-grid-angular', index, 1, 'input', 'be.checked');
    }

    function checkNthDeviceIsDisabled(index) {
        agGrid.cellElementShould('ag-grid-angular', index, 1, 'input', 'not.be.checked');
    }

});
