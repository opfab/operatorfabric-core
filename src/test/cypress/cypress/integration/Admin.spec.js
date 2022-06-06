/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab users administration page */

describe ('AdminPage',()=>{

    it('List, add, edit, delete users', ()=> {

        cy.loginOpFab('admin', 'test');

        //Click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

         //Click on "Administration"
        cy.get('#opfab-navbar-right-menu-admin').click();

        // Check first page has 10 rows
        cy.countAgGridTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 12 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12');

        // Add new user
        cy.get('#add-item').click();

        cy.get('of-edit-user-modal').should('exist');

        // Check login is mandatory
        cy.get('#opfab-admin-user-btn-add').should('be.disabled');

        cy.get('#opfab-login').type('testuser');

        cy.get('#opfab-admin-user-btn-add').should('not.be.disabled');

        cy.get('#opfab-firstName').type('name');

        cy.get('#opfab-lastName').type('surname');

        cy.get('#opfab-groups').click();
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({ force: true });
        cy.get('#opfab-groups').click();


        cy.get('#opfab-entities').click();
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({ force: true });
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        cy.countAgGridTableRows('ag-grid-angular', 3);

        cy.agGridCellShould('ag-grid-angular', 2, 0, 'have.text', 'testuser')

        // Edit previously created user
        cy.clickAgGridCell('ag-grid-angular', 2, 5, 'of-action-cell-renderer');

        cy.get('of-edit-user-modal').should('exist');

        cy.get('#opfab-login').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'testuser');
        cy.agGridCellShould('ag-grid-angular', 2, 1, 'have.text', 'name');
        cy.agGridCellShould('ag-grid-angular', 2, 2, 'have.text', 'surname');
        cy.agGridCellShould('ag-grid-angular', 2, 3, 'have.text', 'Dispatcher');
        cy.agGridCellShould('ag-grid-angular', 2, 4, 'have.text', 'Control Center FR North');


        cy.get('#opfab-firstName').type(' updated');

        cy.get('#opfab-lastName').type(' updated');

        cy.get('#opfab-groups').click();
        // Deselect old group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({ force: true });
        // Select new group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(2).click({ force: true });
        cy.get('#opfab-groups').click();


        cy.get('#opfab-entities').click();
        // Deselect old entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({ force: true });
        // Select new entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(2).click({ force: true });
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-save').click();

        // Check user is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        cy.countAgGridTableRows('ag-grid-angular', 3);

        cy.agGridCellShould('ag-grid-angular', 2, 0, 'have.text', 'testuser');
        cy.agGridCellShould('ag-grid-angular', 2, 1, 'have.text', 'name updated');
        cy.agGridCellShould('ag-grid-angular', 2, 2, 'have.text', 'surname updated');
        cy.agGridCellShould('ag-grid-angular', 2, 3, 'have.text', 'Manager');
        cy.agGridCellShould('ag-grid-angular', 2, 4, 'have.text', 'Control Center FR South');

        // Delete previously created user
        cy.clickAgGridCell('ag-grid-angular', 2, 6, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check user was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12');

        cy.countAgGridTableRows('ag-grid-angular', 2);
    });
 
    it('List, add, edit, delete entites', ()=> {

        cy.loginOpFab('admin', 'test');

        //Click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

         //Click on "Administration"
        cy.get('#opfab-navbar-right-menu-admin').click();

        //Click on tab "Entities"
        cy.get('#opfab-tabs').find('li').eq(1).click();

        // Check first page has 10 rows
        cy.countAgGridTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 13 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        // Add new entity
        cy.get('#add-item').click();

        cy.get('of-edit-entity-modal').should('exist');

        // Check id and name are mandatory
        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-id').type('entityId');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-name').type('entity name');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-description').type('entity description');

        cy.get('#opfab-entity-allowed-to-send-card').check({force: true});

        cy.get('#opfab-parents').click();
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({ force: true });
        cy.get('#opfab-parents').click();


        cy.get('tag-input').find('[aria-label="Add label"]').eq(0).type('Label1');

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        cy.countAgGridTableRows('ag-grid-angular', 4);

        cy.agGridCellShould('ag-grid-angular', 3, 0, 'have.text', 'entityId');
        cy.agGridCellShould('ag-grid-angular', 3, 1, 'have.text', 'entity name');
        cy.agGridCellShould('ag-grid-angular', 3, 2, 'have.text', 'entity description');
        cy.agGridCellShould('ag-grid-angular', 3, 3, 'have.text', 'YES');
        cy.agGridCellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR North');

        // Edit previously created entity
        cy.clickAgGridCell('ag-grid-angular', 3, 5, 'of-action-cell-renderer');

        cy.get('of-edit-entity-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'entityId');



        cy.get('#opfab-name').type(' updated');

        cy.get('#opfab-description').type(' updated');

        cy.get('#opfab-entity-allowed-to-send-card').should('be.checked');
        cy.get('#opfab-entity-allowed-to-send-card').uncheck({force: true});

        cy.get('#opfab-parents').click();
        // Deselect old parents
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({ force: true });
        // Select new parent
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(2).click({ force: true });
        cy.get('#opfab-parents').click();

        cy.get('tag-input').find('[aria-label="Label1"]').should('exist');
        // Add Label2
        cy.get('tag-input').find('[aria-label="Add label"]').eq(0).type('Label2');

        // Remove Label1
         cy.get('tag-input').find('[aria-label="Remove tag"]').eq(0).click();
         cy.get('tag-input').find('[aria-label="Label1"]').should('not.exist');
         cy.get('tag-input').find('[aria-label="Label2"]').should('exist');

        cy.get('#opfab-admin-entity-btn-save').click();

        // Check entity is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        cy.countAgGridTableRows('ag-grid-angular', 4);

        cy.agGridCellShould('ag-grid-angular', 3, 0, 'have.text', 'entityId');
        cy.agGridCellShould('ag-grid-angular', 3, 1, 'have.text', 'entity name updated');
        cy.agGridCellShould('ag-grid-angular', 3, 2, 'have.text', 'entity description updated');
        cy.agGridCellShould('ag-grid-angular', 3, 3, 'have.text', 'NO');
        cy.agGridCellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR South');

        // Delete previously created entity
        cy.clickAgGridCell('ag-grid-angular', 3, 6, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check entity was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        cy.countAgGridTableRows('ag-grid-angular', 3);

    });
})