/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab real time users page */

describe ('ExternalDevicesconfigurationPage',()=>{

    it('List, add, edit, delete user device configuration', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();

        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3);

        // Add new configuration
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');
        
        cy.get('#opfab-usersDropdownList').find('select').select('admin');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-devicesDropdownList').find('select').select('CDS_1');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 4);

        // Edit prevously created row
        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').eq(3).find('of-action-cell-renderer').eq(0).click();

        cy.get('of-externaldevices-modal').should('exist'); 

        cy.get('#opfab-devicesDropdownList').find('select').select('CDS_2');

        cy.get('#opfab-admin-user-btn-save').click();

        // Workaround to let ag-grid update the value in dom, otherwise it fail even if the rigth value is shown on screen
        cy.reload();

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();
        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').eq(3).find('.ag-cell-value').eq(1).contains('CDS_2');


        // Delete prevously created row
        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').eq(3).find('of-action-cell-renderer').eq(1).click();

        cy.get('of-confirmation-dialog').should('exist');
        cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3);

    })

    it('Add device configuration for all available users', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

         //click on "External devices configuration"
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();

        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3);
        
        var i = 0;
        for (i = 0; i < 7; i++) { 
            cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3 + i);

            cy.get('#addItem').click();

            cy.get('of-externaldevices-modal').should('exist');

            cy.get('#opfab-usersDropdownList').find('select').select(1);
    
            cy.get('#opfab-devicesDropdownList').find('select').select('CDS_1');
        
            cy.get('#opfab-admin-edit-btn-add').click();
    
    
        }

        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 10);


        // When all users devices are configured it is not possible to add new configurations
        cy.get('#addItem').click();

        cy.get('of-externaldevices-modal').should('exist');
        cy.get('of-externaldevices-modal').contains('All users devices are already configured');

        cy.get('#opfab-admin-edit-btn-close').eq(0).click();


        // Delete previously created configurations
        var j = 0;
        for (j = 0; j < 7; j++) { 
            cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').eq(3).find('of-action-cell-renderer').eq(1).click();

            cy.get('of-confirmation-dialog').should('exist');
            cy.get('of-confirmation-dialog').find('#opfab-admin-confirmation-btn-ok').click();
            cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 9-j);

        }
        cy.get('#opfab-externaldevices-table-grid').find('.ag-center-cols-container').find('.ag-row').should('have.length', 3);


    })

})