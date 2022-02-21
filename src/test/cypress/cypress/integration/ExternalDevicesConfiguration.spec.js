/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab external devices configuration page */

describe ('ExternalDevicesconfigurationPage',()=>{

    it('List, add, edit, delete user device configuration', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();

        cy.countAgGridTableRows('#opfab-externaldevices-table-grid', 4);

        // Add new configuration
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');
        
        cy.get('#opfab-usersDropdownList').find('select').select('admin');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-devicesDropdownList').find('select').select('CDS_1');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.countAgGridTableRows('#opfab-externaldevices-table-grid', 5);

        // Edit previously created row
        cy.clickAgGridCell('#opfab-externaldevices-table-grid', 4, 2, 'of-action-cell-renderer');

        cy.get('of-externaldevices-modal').should('exist'); 

        cy.get('#opfab-devicesDropdownList').find('select').select('CDS_2');

        cy.get('#opfab-admin-user-btn-save').click();

        // Workaround to let ag-grid update the value in dom, otherwise it fails even if the right value is shown on screen
        cy.reload();

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();
        cy.checkAgGridCellValue('#opfab-externaldevices-table-grid', 4, 1, 'CDS_2')

        // Delete previously created row
        cy.clickAgGridCell('#opfab-externaldevices-table-grid', 4, 3, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');
        cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
        cy.countAgGridTableRows('#opfab-externaldevices-table-grid', 4);

    })

    it('Add device configuration for all available users', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();


        // We iterate 8 times because there are 12 users and 4 users have already a configuration
        for (let i = 0; i < 8; i++) {

            cy.get('#addItem').click();

            cy.get('of-externaldevices-modal').should('exist');

            cy.get('#opfab-usersDropdownList').find('select').select(1);
    
            cy.get('#opfab-devicesDropdownList').find('select').select('CDS_1');
        
            cy.get('#opfab-admin-edit-btn-add').click();  
        }

        //First page is 10 rows
        cy.countAgGridTableRows('#opfab-externaldevices-table-grid', 10);

        // Pagination should display ' Results number  : 12 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12')


        // When all users devices are configured it is not possible to add new configurations
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');
        cy.get('#opfab-usersDropdownList').should('not.exist');
        cy.get('of-externaldevices-modal').contains('All users devices are already configured');

        cy.get('#opfab-admin-edit-btn-close').eq(0).click();

    })

    it('Delete added device configurations', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();

        cy.get('#opfab-externaldevices-table-grid').should('exist');

        // Delete previously created configurations
        for (let j = 12; j > 4; j--) {
            cy.clickAgGridCell('#opfab-externaldevices-table-grid', 4, 3, 'of-action-cell-renderer');

            cy.get('of-confirmation-dialog').should('exist');
            cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
            cy.waitDefaultTime();
        }
        cy.countAgGridTableRows('#opfab-externaldevices-table-grid', 4);
    })

})