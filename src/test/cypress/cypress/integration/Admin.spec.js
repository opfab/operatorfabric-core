/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {AgGridCommands} from '../support/agGridCommands';
import {ScriptCommands} from '../support/scriptCommands';

describe('AdmininstrationPages', () => {
    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.loadTestConf();
        script.cleanDownloadsDir();
    });

    it('List, add, edit, delete users', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        // Check first page has 10 rows
        agGrid.countTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 18 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 18');

        // Add new user
        cy.get('#add-item').click();

        cy.get('of-edit-user-modal').should('exist');

        // Check login is mandatory
        cy.get('#opfab-admin-user-btn-add').should('be.disabled');

        cy.get('#opfab-login').type('testuser');

        cy.get('#opfab-admin-user-btn-add').should('not.be.disabled');

        cy.get('#opfab-firstName').type('name');

        cy.get('#opfab-lastName').type('surname');

        cy.get('#opfab-comment').type('comment');

        cy.get('#opfab-groups').click();
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-groups').click();

        cy.get('#opfab-entities').click();
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 19');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 9);

        agGrid.cellShould('ag-grid-angular', 8, 0, 'have.text', 'testuser');

        // Edit previously created user
        agGrid.clickCell('ag-grid-angular', 8, 5, 'of-action-cell-renderer');

        cy.get('of-edit-user-modal').should('exist');

        cy.get('#opfab-login').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'testuser');
        agGrid.cellShould('ag-grid-angular', 8, 1, 'have.text', 'name');
        agGrid.cellShould('ag-grid-angular', 8, 2, 'have.text', 'surname');
        agGrid.cellShould('ag-grid-angular', 8, 3, 'have.text', 'Dispatcher');
        agGrid.cellShould('ag-grid-angular', 8, 4, 'have.text', 'Control Center FR North');

        cy.get('#opfab-firstName').type(' updated');

        cy.get('#opfab-lastName').type(' updated');

        cy.get('#opfab-comment').should('have.value', 'comment');

        cy.get('#opfab-groups').click();
        // Deselect old group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(3).click({force: true});
        cy.get('#opfab-groups').click();

        cy.get('#opfab-entities').click();
        // Deselect old entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-save').click();

        // Check user is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 19');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 9);

        agGrid.cellShould('ag-grid-angular', 8, 0, 'have.text', 'testuser');
        agGrid.cellShould('ag-grid-angular', 8, 1, 'have.text', 'name updated');
        agGrid.cellShould('ag-grid-angular', 8, 2, 'have.text', 'surname updated');
        agGrid.cellShould('ag-grid-angular', 8, 3, 'have.text', 'Manager');
        agGrid.cellShould('ag-grid-angular', 8, 4, 'have.text', 'Control Center FR South');

        // Delete previously created user
        agGrid.clickCell('ag-grid-angular', 8, 6, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check user was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 18');

        agGrid.countTableRows('ag-grid-angular', 8);
    });

    it('List, add, edit, delete entities', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Entities"
        cy.get('#opfab-tabs').find('li').eq(1).click();

        // Check first page has 10 rows
        agGrid.countTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 16 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 16');

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

        cy.get('tag-input').find('[aria-label="Add label"]').eq(0).type('Label1');

        cy.get('#opfab-roles').click();
        cy.get('#opfab-roles').find('.vscomp-option-text').eq(3).click({force: true});
        cy.get('#opfab-roles').click();

        cy.get('#opfab-parents').click();
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-parents').click();

        cy.get('#opfab-entity-users').click();
        cy.get('#opfab-entity-users').find('.vscomp-option-text').eq(5).click({force: true});
        cy.get('#opfab-entity-users').click();

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 16');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 7);

        agGrid.cellShould('ag-grid-angular', 6, 0, 'have.text', 'entityId');
        agGrid.cellShould('ag-grid-angular', 6, 1, 'have.text', 'entity name');
        agGrid.cellShould('ag-grid-angular', 6, 2, 'have.text', 'entity description');
        agGrid.cellShould('ag-grid-angular', 6, 4, 'have.text', 'Control Center FR North');

        // Edit previously created entity
        agGrid.clickCell('ag-grid-angular', 6, 5, 'of-action-cell-renderer');

        cy.get('of-edit-entity-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'entityId');

        cy.get('#opfab-name').type(' updated');

        cy.get('#opfab-description').type(' updated');

        cy.get('#opfab-roles').click();
        // Deselect old roles
        cy.get('#opfab-roles').find('.vscomp-option-text').eq(3).click({force: true});
        // Select new role
        cy.get('#opfab-roles').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-roles').click();

        cy.get('tag-input').find('[aria-label="Label1"]').should('exist');
        // Add Label2
        // Using type('Label2') ends up sometimes with a truncated value, so we use invoke('val', 'Label2') instead
        cy.get('tag-input').find('[aria-label="Add label"]').eq(0).invoke('val', 'Label2').trigger('input');

        // Remove Label1
        cy.get('tag-input').find('[aria-label="Remove tag"]').eq(0).click();
        cy.get('tag-input').find('[aria-label="Label1"]').should('not.exist');
        cy.get('tag-input').find('[aria-label="Label2"]').should('exist');

        cy.get('#opfab-parents').click();
        // Deselect old parents
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new parent
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-parents').click();

        cy.get('#opfab-entity-users').find('.vscomp-option.selected').should('have.length', 1);
        cy.get('#opfab-entity-users')
            .find('.vscomp-option.selected')
            .eq(0)
            .should('have.attr', 'data-value', 'operator1_it');

        cy.get('#opfab-admin-entity-btn-save').click();

        // Check entity is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 17');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 7);

        agGrid.cellShould('ag-grid-angular', 6, 0, 'have.text', 'entityId');
        agGrid.cellShould('ag-grid-angular', 6, 1, 'have.text', 'entity name updated');
        agGrid.cellShould('ag-grid-angular', 6, 2, 'have.text', 'entity description updated');
        agGrid.cellShould('ag-grid-angular', 6, 4, 'have.text', 'Control Center FR South');

        // Delete previously created entity
        agGrid.clickCell('ag-grid-angular', 6, 6, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check entity was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 16');

        agGrid.countTableRows('ag-grid-angular', 6);

        // Edit ENTITY2_FR entity to check users list
        cy.get('ngb-pagination').find('.page-link').eq(1).click();

        agGrid.clickCell('ag-grid-angular', 1, 5, 'of-action-cell-renderer');

        cy.get('of-edit-entity-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'ENTITY2_FR');

        cy.get('#opfab-entity-users').find('.vscomp-option.selected').should('have.length', 4);
        cy.get('#opfab-entity-users').find('.vscomp-option.selected').eq(0).should('have.attr', 'data-value', 'admin');
        cy.get('#opfab-entity-users')
            .find('.vscomp-option.selected')
            .eq(1)
            .should('have.attr', 'data-value', 'operator1_crisisroom');
        cy.get('#opfab-entity-users')
            .find('.vscomp-option.selected')
            .eq(2)
            .should('have.attr', 'data-value', 'operator2_fr');
        cy.get('#opfab-entity-users')
            .find('.vscomp-option.selected')
            .eq(3)
            .should('have.attr', 'data-value', 'operator4_fr');
    });

    it('List, add, edit, delete groups', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on "Groups Management"
        cy.get('#opfab-admin-groups-tab').click();

        // Check the page has 7 rows
        agGrid.countTableRows('ag-grid-angular', 7);

        // Pagination should display ' Results number  : 7 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 7');

        // Add new group
        cy.get('#add-item').click();

        cy.get('of-edit-group-modal').should('exist');

        // Check id and name are mandatory
        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-id').type('testgroup');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-name').type('group name');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-description').type('group description');

        cy.get('#opfab-perimeters').click();
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-perimeters').click();

        cy.get('#opfab-permissions').click();
        cy.get('#opfab-permissions').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-permissions').click();

        cy.get('#opfab-group-users').click();
        cy.get('#opfab-group-users').find('.vscomp-option-text').eq(5).click({force: true});
        cy.get('#opfab-group-users').click();

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);

        agGrid.cellShould('ag-grid-angular', 7, 0, 'have.text', 'testgroup');

        // Edit previously created group
        agGrid.clickCell('ag-grid-angular', 7, 5, 'of-action-cell-renderer');

        cy.get('of-edit-group-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'testgroup');
        agGrid.cellShould('ag-grid-angular', 7, 1, 'have.text', 'group name');
        agGrid.cellShould('ag-grid-angular', 7, 2, 'have.text', 'group description');
        agGrid.cellShould('ag-grid-angular', 7, 3, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 7, 4, 'have.text', 'READONLY');

        cy.get('#opfab-name').type(' updated');

        cy.get('#opfab-description').type(' updated');

        cy.get('#opfab-group-users').find('.vscomp-option.selected').should('have.length', 1);
        cy.get('#opfab-group-users')
            .find('.vscomp-option.selected')
            .eq(0)
            .should('have.attr', 'data-value', 'operator1_it');

        cy.get('#opfab-perimeters').click();
        // Deselect old perimeter
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new perimeter
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-perimeters').click();

        cy.get('#opfab-permissions').click();
        // Deselect old permission
        cy.get('#opfab-permissions').find('.vscomp-option-text').eq(2).click({force: true});
        // Select new permission
        cy.get('#opfab-permissions').find('.vscomp-option-text').eq(3).click({force: true});
        cy.get('#opfab-permissions').click();

        cy.get('#opfab-admin-user-btn-save').click();

        cy.waitDefaultTime();

        // Check group is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);

        agGrid.cellShould('ag-grid-angular', 7, 0, 'have.text', 'testgroup');
        agGrid.cellShould('ag-grid-angular', 7, 1, 'have.text', 'group name updated');
        agGrid.cellShould('ag-grid-angular', 7, 2, 'have.text', 'group description updated');
        agGrid.cellShould('ag-grid-angular', 7, 3, 'have.text', 'defaultProcess');
        agGrid.cellShould('ag-grid-angular', 7, 4, 'have.text', 'VIEW_ALL_CARDS');

        // Delete previously created group
        agGrid.clickCell('ag-grid-angular', 7, 6, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check group was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 7');

        agGrid.countTableRows('ag-grid-angular', 7);

        // Edit RTE group to check users list
        agGrid.clickCell('ag-grid-angular', 1, 5, 'of-action-cell-renderer');

        cy.get('of-edit-group-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'RTE');
        cy.get('#opfab-group-users').find('.vscomp-option.selected').should('have.length', 2);
        cy.get('#opfab-group-users')
            .find('.vscomp-option.selected')
            .eq(0)
            .should('have.attr', 'data-value', 'operator3_fr');
        cy.get('#opfab-group-users')
            .find('.vscomp-option.selected')
            .eq(1)
            .should('have.attr', 'data-value', 'operator5_fr');
    });

    it('List, add, edit, delete perimeters', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on "Perimeters Management"
        cy.get('#opfab-admin-perimeters-tab').click();

        // Check first page has 10 rows
        agGrid.countTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 11 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 11');

        // Add new perimeter
        cy.get('#add-item').click();

        cy.get('of-edit-perimeter-modal').should('exist');

        // Check at least one process/state is mandatory
        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('#opfab-id').type('testperimeter');

        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('#opfab-admin-perimeter-process-filter')
            .find('.vscomp-option-text')
            .eq(2)
            .should('contain.text', 'cypress - Test process for cypress')
            .click({force: true});

        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('be.checked');

        cy.get('#opfab-admin-perimeter-state-filter')
            .find('.vscomp-option-text')
            .eq(1)
            .should('contain.text', 'Message')
            .click({force: true});

        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('#opfab-admin-perimeter-right-filter')
            .find('.vscomp-option-text')
            .eq(0)
            .should('contain.text', 'ReceiveAndWrite')
            .click({force: true});

        cy.get('#opfab-admin-perimeter-btn-add').should('not.be.disabled');

        cy.get('#opfab-admin-perimeter-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12');

        agGrid.countTableRows('ag-grid-angular', 10);

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.cellShould('ag-grid-angular', 1, 0, 'have.text', 'testperimeter');
        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'contains.text', 'Message');
        // We check the right for Message is ReceiveAndWrite (the badge must be from class opfab-bg-right-receiveandwrite)
        cy.get('ag-grid-angular')
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(1)
            .find('.ag-cell-value')
            .find('.opfab-bg-right-receiveandwrite')
            .eq(0)
            .should('exist');

        // Edit previously created perimeter
        agGrid.clickCell('ag-grid-angular', 1, 3, 'of-action-cell-renderer');

        cy.get('of-edit-perimeter-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'testperimeter');

        cy.get('#opfab-admin-perimeter-state-filter').click();
        cy.get('#opfab-admin-perimeter-state-filter')
            .find('.vscomp-option-text')
            .eq(3)
            .should('contain.text', 'Message with no ack')
            .click({force: true});

        cy.get('#opfab-admin-perimeter-right-filter')
            .find('.vscomp-option-text')
            .eq(1)
            .should('contain.text', 'Receive')
            .click({force: true});

        // We uncheck the field 'filtering notification allowed'
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').click();
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('not.be.checked');

        // We save changes
        cy.get('#opfab-admin-perimeter-btn-save').click();

        cy.waitDefaultTime();

        // We still have 12 rows
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 12');

        agGrid.countTableRows('ag-grid-angular', 2); // we are on the second page

        // We check the perimeter is updated
        agGrid.cellShould('ag-grid-angular', 1, 0, 'have.text', 'testperimeter');
        agGrid.cellShould('ag-grid-angular', 1, 1, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 1, 2, 'contains.text', 'Message with no ack');
        // We check the right for Message is Receive (the badge must be from class opfab-bg-right-receive)
        cy.get('ag-grid-angular')
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(1)
            .find('.ag-cell-value')
            .find('.opfab-bg-right-receive')
            .eq(0)
            .should('exist');

        // We check the 'filtering notification allowed' is still unchecked, and we close the modal
        agGrid.clickCell('ag-grid-angular', 1, 3, 'of-action-cell-renderer');
        cy.get('of-edit-perimeter-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'testperimeter');
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('not.be.checked');
        cy.get('#opfab-admin-perimeter-btn-close').click();

        // Delete previously created perimeter
        agGrid.clickCell('ag-grid-angular', 1, 4, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check perimeter was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 11');

        agGrid.countTableRows('ag-grid-angular', 1);
    });

    it('List, delete processes', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on "Processes Management"
        cy.get('#opfab-admin-processes-tab').click();

        // Check the content of the first row
        agGrid.cellShould('ag-grid-angular', 0, 0, 'have.text', 'taskExample');

        agGrid.cellShould('ag-grid-angular', 0, 1, 'have.text', 'Task');

        agGrid.cellShould('ag-grid-angular', 0, 2, 'have.text', '1');

        // Check the page has 9 rows
        agGrid.countTableRows('ag-grid-angular', 9);

        // Pagination should display ' Results number  : 9 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 9');

        // Delete first process
        agGrid.clickCell('ag-grid-angular', 0, 3, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check process was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);
    });

    it('List, delete businessdata', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on "Business Data"
        cy.get('#opfab-admin-businessData-tab').click();

        // Check the content of the rows
        agGrid.cellShould('ag-grid-angular', 0, 0, 'have.text', 'services');
        agGrid.cellShould('ag-grid-angular', 1, 0, 'have.text', 'message-and-question-list');

        // Check the page has 3 rows
        agGrid.countTableRows('ag-grid-angular', 2);

        // Pagination should display ' Results number  : 3 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 2');

        // Upload test file
        cy.get('#add-item').click();
        cy.get('#fileUploader').selectFile('cypress/fixtures/businessDataTest', {force: true});

        cy.waitDefaultTime();

        // Delete first business data file
        agGrid.clickCell('ag-grid-angular', 0, 3, 'of-action-cell-renderer');

        cy.get('#opfab-btn-ok').click();

        cy.waitDefaultTime();

        //Check the business data file that was created is deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 2');

        // Download the services file
        agGrid.clickCell('ag-grid-angular', 0, 2, 'of-action-cell-renderer');

        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^services.json/);
            cy.readFile('./cypress/downloads/services.json').then((labels) => {
                expect(labels[0].label).to.eq('Group 1');
                expect(labels[1].label).to.eq('Group 2');
            });
        });

        agGrid.countTableRows('ag-grid-angular', 2);
    });

    describe('Check export files', function () {
        before('Clean export directory', function () {
            script.cleanDownloadsDir();
        });

        afterEach('Clean export directory', function () {
            script.cleanDownloadsDir();
        });

        it('Check users export', function () {
            opfab.loginWithUser('admin');
            opfab.navigateToAdministration();

            //Click on tab "Users"
            cy.get('#opfab-tabs').find('li').eq(0).click();

            // Wait for table rendering
            cy.get('.opfab-pagination').should('contain.text', ' Results number  : 18');

            // Do export
            cy.get('#opfab-admin-btn-exportToExcel').click();

            cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
                expect(files.length).to.equal(1);

                // check file name
                expect(files[0]).to.match(/^user_export_\d*\.xlsx/);
                // check file content
                cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                    expect(rows.length).to.equal(18);

                    expect(rows[0].LOGIN).to.equal('admin');
                    expect(rows[0]['FIRST NAME']).to.be.undefined;
                    expect(rows[0]['LAST NAME']).to.be.undefined;
                    expect(rows[0].GROUPS).to.equal('ADMINISTRATORS');
                    expect(rows[0].ENTITIES).to.equal('Control Center FR North, Control Center FR South');

                    expect(rows[1].LOGIN).to.equal('operator1_fr');
                    expect(rows[1]['FIRST NAME']).to.equal('John');
                    expect(rows[1]['LAST NAME']).to.equal('Doe');
                    expect(rows[1].GROUPS).to.equal('Dispatcher, Maintainer');
                    expect(rows[1].ENTITIES).to.equal('Control Center FR North');
                });
            });
        });

        it('Check entities export', function () {
            opfab.loginWithUser('admin');
            opfab.navigateToAdministration();

            //Click on tab "Entities"
            cy.get('#opfab-tabs').find('li').eq(1).click();

            // Wait for table rendering
            cy.get('.opfab-pagination').should('contain.text', ' Results number  : 16');

            // Do export
            cy.get('#opfab-admin-btn-exportToExcel').click();

            cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
                expect(files.length).to.equal(1);

                // check file name
                expect(files[0]).to.match(/^entity_export_\d*\.xlsx/);
                // check file content
                cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                    expect(rows.length).to.equal(16);

                    expect(rows[0].ID).to.equal('ENTITY1_FR');
                    expect(rows[0].NAME).to.equal('Control Center FR North');
                    expect(rows[0].DESCRIPTION).to.equal('Control Center FR North');
                    expect(rows[0]['PARENT ENTITIES']).to.equal('French Control Centers');

                    expect(rows[4].ID).to.equal('ENTITY_FR');
                    expect(rows[4].NAME).to.equal('French Control Centers');
                    expect(rows[4].DESCRIPTION).to.equal('French Control Centers');
                    expect(rows[4]['PARENT ENTITIES']).to.equal('');
                });
            });
        });

        it('Check groups export', function () {
            opfab.loginWithUser('admin');
            opfab.navigateToAdministration();

            //Click on tab "Groups"
            cy.get('#opfab-tabs').find('li').eq(2).click();

            //Wait for table rendering
            cy.get('.opfab-pagination').should('contain.text', ' Results number  : 7');

            // Do export
            cy.get('#opfab-admin-btn-exportToExcel').click();

            cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
                expect(files.length).to.equal(1);

                // check file name
                expect(files[0]).to.match(/^group_export_\d*\.xlsx/);
                // check file content
                cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                    expect(rows.length).to.equal(7);

                    expect(rows[0].ID).to.equal('ADMIN');
                    expect(rows[0].NAME).to.equal('ADMINISTRATORS');
                    expect(rows[0].DESCRIPTION).to.equal('The admin group');
                    expect(rows[0].TYPE).to.be.undefined;
                    expect(rows[0].PERIMETERS).to.equal('');

                    expect(rows[2].ID).to.equal('Dispatcher');
                    expect(rows[2].NAME).to.equal('Dispatcher');
                    expect(rows[2].DESCRIPTION).to.equal('Dispatcher Group');
                    expect(rows[2].TYPE).to.be.undefined;
                    expect(rows[2].PERIMETERS).to.equal(
                        'conferenceAndITIncidentExample, cypress, defaultProcess, externalRecipient, gridCooperation, messageOrQuestionExample, question, supervisor, taskAdvancedExample, taskExample'
                    );
                });
            });
        });

        it('Check perimeters export', function () {
            opfab.loginWithUser('admin');
            opfab.navigateToAdministration();

            //Click on tab "Perimeters"
            cy.get('#opfab-tabs').find('li').eq(3).click();

            // Wait for table rendering
            cy.get('.opfab-pagination').should('contain.text', ' Results number  : 11');

            // Do export
            cy.get('#opfab-admin-btn-exportToExcel').click();

            cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
                expect(files.length).to.equal(1);

                // check file name
                expect(files[0]).to.match(/^perimeter_export_\d*\.xlsx/);
                // check file content
                cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                    expect(rows.length).to.equal(11);

                    expect(rows[0].ID).to.equal('conferenceAndITIncidentExample');
                    expect(rows[0].PROCESS).to.equal('conferenceAndITIncidentExample');
                    expect(rows[0]['STATE RIGHTS']).to.equal(
                        '{"state":"Conference Call ☏","right":"ReceiveAndWrite","filteringNotificationAllowed":true},{"state":"IT Incident","right":"ReceiveAndWrite","filteringNotificationAllowed":true}'
                    );
                });
            });
        });

        it('Check business data export', function () {
            opfab.loginWithUser('admin');
            opfab.navigateToAdministration();

            //Click on "Business Data"
            cy.get('#opfab-admin-businessData-tab').click();

            //Wait for table rendering
            cy.get('.opfab-pagination').should('contain.text', ' Results number  : 2');

            // Do export
            cy.get('#opfab-admin-btn-exportToExcel').click();

            cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
                expect(files.length).to.equal(1);

                // check file name
                expect(files[0]).to.match(/^businessData_export_\d*\.xlsx/);
                // check file content
                cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                    expect(rows.length).to.equal(2);
                    expect(rows[0]['BUSINESS DATA']).to.equal('services');
                    expect(rows[1]['BUSINESS DATA']).to.equal('message-and-question-list');
                });
            });
        });
    });
});
