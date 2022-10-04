/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {AgGridCommands} from "../support/agGridCommands";


describe('AdmininstrationPages', () => {

    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();

    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    it('List, add, edit, delete users', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        // Check first page has 10 rows
        agGrid.countTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 13 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

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
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-groups').click();

        cy.get('#opfab-entities').click();
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 4);

        agGrid.cellShould('ag-grid-angular', 3, 0, 'have.text', 'testuser');

        // Edit previously created user
        agGrid.clickCell('ag-grid-angular', 3, 5, 'of-action-cell-renderer');

        cy.get('of-edit-user-modal').should('exist');

        cy.get('#opfab-login').should('not.exist');

        cy.get('.modal-title').should('contain.text', 'testuser');
        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'name');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'surname');
        agGrid.cellShould('ag-grid-angular', 3, 3, 'have.text', 'Dispatcher');
        agGrid.cellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR North');

        cy.get('#opfab-firstName').type(' updated');

        cy.get('#opfab-lastName').type(' updated');

        cy.get('#opfab-groups').click();
        // Deselect old group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-groups').click();

        cy.get('#opfab-entities').click();
        // Deselect old entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-save').click();

        // Check user is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 4);

        agGrid.cellShould('ag-grid-angular', 3, 0, 'have.text', 'testuser');
        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'name updated');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'surname updated');
        agGrid.cellShould('ag-grid-angular', 3, 3, 'have.text', 'Manager');
        agGrid.cellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR South');

        // Delete previously created user
        agGrid.clickCell('ag-grid-angular', 3, 6, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check user was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        agGrid.countTableRows('ag-grid-angular', 3);
    });

    it('List, add, edit, delete entities', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Entities"
        cy.get('#opfab-tabs').find('li').eq(1).click();

        // Check first page has 10 rows
        agGrid.countTableRows('ag-grid-angular', 10);

        // Pagination should display ' Results number  : 13 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        // Add new entity
        cy.get('#add-item').click();

        cy.get('of-edit-entity-modal').should('exist');

        // Check id and name are mandatory
        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-id').type('entityId');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-entity-users').should('not.exist');

        cy.get('#opfab-name').type('entity name');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-description').type('entity description');

        cy.get('#opfab-entity-allowed-to-send-card').check({force: true});

        cy.get('#opfab-parents').click();
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-parents').click();

        cy.get('tag-input').find('[aria-label="Add label"]').eq(0).type('Label1');

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 14');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();

        agGrid.countTableRows('ag-grid-angular', 4);

        agGrid.cellShould('ag-grid-angular', 3, 0, 'have.text', 'entityId');
        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'entity name');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'entity description');
        agGrid.cellShould('ag-grid-angular', 3, 3, 'have.text', 'YES');
        agGrid.cellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR North');

        // Edit previously created entity
        agGrid.clickCell('ag-grid-angular', 3, 5, 'of-action-cell-renderer');

        cy.get('of-edit-entity-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');

        cy.get('#opfab-entity-users').should('be.empty');

        cy.get('.modal-title').should('contain.text', 'entityId');

        cy.get('#opfab-name').type(' updated');

        cy.get('#opfab-description').type(' updated');

        cy.get('#opfab-entity-allowed-to-send-card').should('be.checked');
        cy.get('#opfab-entity-allowed-to-send-card').uncheck({force: true});

        cy.get('#opfab-parents').click();
        // Deselect old parents
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new parent
        cy.get('#opfab-parents').find('.vscomp-option-text').eq(2).click({force: true});
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

        agGrid.countTableRows('ag-grid-angular', 4);

        agGrid.cellShould('ag-grid-angular', 3, 0, 'have.text', 'entityId');
        agGrid.cellShould('ag-grid-angular', 3, 1, 'have.text', 'entity name updated');
        agGrid.cellShould('ag-grid-angular', 3, 2, 'have.text', 'entity description updated');
        agGrid.cellShould('ag-grid-angular', 3, 3, 'have.text', 'NO');
        agGrid.cellShould('ag-grid-angular', 3, 4, 'have.text', 'Control Center FR South');

        // Delete previously created entity
        agGrid.clickCell('ag-grid-angular', 3, 6, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check entity was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 13');

        agGrid.countTableRows('ag-grid-angular', 3);

        // Edit ENTITY2_FR entity to check users list
        cy.get('ngb-pagination').find('.page-link').eq(1).click();

        agGrid.clickCell('ag-grid-angular', 1, 5, 'of-action-cell-renderer');

        cy.get('of-edit-entity-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'ENTITY2_FR');
        cy.get('#opfab-entity-users').contains('admin, operator2_fr, operator4_fr');
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

        cy.get('#opfab-group-users').should('not.exist');

        cy.get('#opfab-id').type('testgroup');

        cy.get('#opfab-admin-edit-btn-add').should('be.disabled');

        cy.get('#opfab-name').type('group name');

        cy.get('#opfab-admin-edit-btn-add').should('not.be.disabled');

        cy.get('#opfab-description').type('group description');

        // we choose ROLE
        clickOnNthGroupTypeInDropdown(1);

        cy.get('#opfab-perimeters').click();
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-perimeters').click();

        cy.get('#opfab-realtime').check({force: true});

        cy.get('#opfab-admin-edit-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);

        agGrid.cellShould('ag-grid-angular', 7, 0, 'have.text', 'testgroup');

        // Edit previously created group
        agGrid.clickCell('ag-grid-angular', 7, 6, 'of-action-cell-renderer');

        cy.get('of-edit-group-modal').should('exist');

        cy.get('#opfab-id').should('not.exist');
        cy.get('#opfab-group-users').should('be.empty');

        cy.get('.modal-title').should('contain.text', 'testgroup');
        agGrid.cellShould('ag-grid-angular', 7, 1, 'have.text', 'group name');
        agGrid.cellShould('ag-grid-angular', 7, 2, 'have.text', 'group description');
        agGrid.cellShould('ag-grid-angular', 7, 3, 'have.text', 'ROLE');
        agGrid.cellShould('ag-grid-angular', 7, 4, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 7, 5, 'have.text', 'YES');

        cy.get('#opfab-name').type(' updated');

        cy.get('#opfab-description').type(' updated');

        // we choose PERMISSION
        clickOnNthGroupTypeInDropdown(0);

        cy.get('#opfab-perimeters').click();
        // Deselect old perimeter
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new perimeter
        cy.get('#opfab-perimeters').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-perimeters').click();
        // Deselect realtime parameter
        cy.get('#opfab-realtime').uncheck({force: true});

        cy.get('#opfab-admin-user-btn-save').click();

        cy.waitDefaultTime();

        // Check group is updated
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);

        agGrid.cellShould('ag-grid-angular', 7, 0, 'have.text', 'testgroup');
        agGrid.cellShould('ag-grid-angular', 7, 1, 'have.text', 'group name updated');
        agGrid.cellShould('ag-grid-angular', 7, 2, 'have.text', 'group description updated');
        agGrid.cellShould('ag-grid-angular', 7, 3, 'have.text', 'PERMISSION');
        agGrid.cellShould('ag-grid-angular', 7, 4, 'have.text', 'defaultProcess');
        agGrid.cellShould('ag-grid-angular', 7, 5, 'have.text', 'NO');

        // Delete previously created group
        agGrid.clickCell('ag-grid-angular', 7, 7, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check group was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 7');

        agGrid.countTableRows('ag-grid-angular', 7);


         // Edit RTE group to check users list
         agGrid.clickCell('ag-grid-angular', 1, 6, 'of-action-cell-renderer');

         cy.get('of-edit-group-modal').should('exist');
         cy.get('.modal-title').should('contain.text', 'RTE');
         cy.get('#opfab-group-users').contains('operator3_fr, operator5_fr');
    });

    it('List, add, edit, delete perimeters', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on "Perimeters Management"
        cy.get('#opfab-admin-perimeters-tab').click();

        // Check first page has 8 rows
        agGrid.countTableRows('ag-grid-angular', 8);

        // Pagination should display ' Results number  : 8 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        // Add new perimeter
        cy.get('#add-item').click();

        cy.get('of-edit-perimeter-modal').should('exist');

        // Check at least one process/state is mandatory
        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('#opfab-id').type('testperimeter');

        cy.get('#opfab-admin-perimeter-btn-add').should('be.disabled');

        cy.get('#opfab-admin-perimeter-process-filter')
            .find('.vscomp-option-text')
            .eq(1)
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
            .should('contain.text', 'Write')
            .click({force: true});

        cy.get('#opfab-admin-perimeter-btn-add').should('not.be.disabled');

        cy.get('#opfab-admin-perimeter-btn-add').click();

        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 9');

        agGrid.countTableRows('ag-grid-angular', 9);

        agGrid.cellShould('ag-grid-angular', 8, 0, 'have.text', 'testperimeter');
        agGrid.cellShould('ag-grid-angular', 8, 1, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 8, 2, 'have.text', 'Message');
        // We check the right for Message is Write (the badge must be from class opfab-bg-right-write)
        cy.get('ag-grid-angular')
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(8)
            .find('.ag-cell-value')
            .find('.opfab-bg-right-write')
            .eq(0)
            .should('exist');

        // Edit previously created perimeter
        agGrid.clickCell('ag-grid-angular', 8, 3, 'of-action-cell-renderer');

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
            .should('contain.text', 'ReceiveAndWrite')
            .click({force: true});

        // We uncheck the field 'filtering notification allowed'
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').click();
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('not.be.checked');

        // We save changes
        cy.get('#opfab-admin-perimeter-btn-save').click();

        cy.waitDefaultTime();

        // We still have 9 rows
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 9');

        agGrid.countTableRows('ag-grid-angular', 9);

        // We check the perimeter is updated
        agGrid.cellShould('ag-grid-angular', 8, 0, 'have.text', 'testperimeter');
        agGrid.cellShould('ag-grid-angular', 8, 1, 'have.text', 'cypress');
        agGrid.cellShould('ag-grid-angular', 8, 2, 'have.text', 'Message with no ack');
        // We check the right for Message is ReceiveAndWrite (the badge must be from class opfab-bg-right-receiveandwrite)
        cy.get('ag-grid-angular')
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(8)
            .find('.ag-cell-value')
            .find('.opfab-bg-right-receiveandwrite')
            .eq(0)
            .should('exist');

        // We check the 'filtering notification allowed' is still unchecked, and we close the modal
        agGrid.clickCell('ag-grid-angular', 8, 3, 'of-action-cell-renderer');
        cy.get('of-edit-perimeter-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'testperimeter');
        cy.get('.opfab-checkbox').contains('FILTERING NOTIFICATION ALLOWED ').find('input').should('not.be.checked');
        cy.get('#opfab-admin-perimeter-btn-close').click();

        // Delete previously created perimeter
        agGrid.clickCell('ag-grid-angular', 8, 4, 'of-action-cell-renderer');

        cy.get('of-confirmation-dialog').should('exist');

        cy.get('#opfab-admin-confirmation-btn-ok').click();

        cy.waitDefaultTime();

        //Check perimeter was deleted
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 8');

        agGrid.countTableRows('ag-grid-angular', 8);
    });

    it('Check users export', function () {
        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Users"
        cy.get('#opfab-tabs').find('li').eq(0).click();

        // Do export
        cy.get('#opfab-admin-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^user_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(13);

                expect(rows[0].LOGIN).to.equal('admin');
                expect(rows[0]['FIRST NAME']).to.be.undefined;
                expect(rows[0]['LAST NAME']).to.be.undefined;
                expect(rows[0].GROUPS).to.equal('ADMINISTRATORS');
                expect(rows[0].ENTITIES).to.equal('Control Center FR North,Control Center FR South');

                expect(rows[1].LOGIN).to.equal('operator1_fr');
                expect(rows[1]['FIRST NAME']).to.equal('John');
                expect(rows[1]['LAST NAME']).to.equal('Doe');
                expect(rows[1].GROUPS).to.equal('Dispatcher,ReadOnly');
                expect(rows[1].ENTITIES).to.equal('Control Center FR North');

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
        })
    })

    it('Check entities export', function () {

        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Entities"
        cy.get('#opfab-tabs').find('li').eq(1).click();

        // Do export
        cy.get('#opfab-admin-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^entity_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(13);

                expect(rows[0].ID).to.equal('ENTITY1_FR');
                expect(rows[0].NAME).to.equal('Control Center FR North');
                expect(rows[0].DESCRIPTION).to.equal('Control Center FR North');
                expect(rows[0]['CARD SENDING ALLOWED']).to.equal('YES');
                expect(rows[0]['PARENT ENTITIES']).to.equal('French Control Centers');

                expect(rows[4].ID).to.equal('ENTITY_FR');
                expect(rows[4].NAME).to.equal('French Control Centers');
                expect(rows[4].DESCRIPTION).to.equal('French Control Centers');
                expect(rows[4]['CARD SENDING ALLOWED']).to.equal('NO');
                expect(rows[4]['PARENT ENTITIES']).to.be.undefined;

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
        })
    })

    it('Check groups export', function () {

        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Groups"
        cy.get('#opfab-tabs').find('li').eq(2).click();

        // Do export
        cy.get('#opfab-admin-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^group_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(7);
                
                expect(rows[0].ID).to.equal('ADMIN');
                expect(rows[0].NAME).to.equal('ADMINISTRATORS');
                expect(rows[0].DESCRIPTION).to.equal('The admin group');
                expect(rows[0].TYPE).to.be.undefined;
                expect(rows[0].PERIMETERS).to.be.undefined;
                expect(rows[0]['REAL TIME']).to.equal('NO');

                expect(rows[2].ID).to.equal('Dispatcher');
                expect(rows[2].NAME).to.equal('Dispatcher');
                expect(rows[2].DESCRIPTION).to.equal('Dispatcher Group');
                expect(rows[2].TYPE).to.be.undefined;
                expect(rows[2].PERIMETERS).to.equal('conferenceAndITIncidentExample,cypress,defaultProcess,gridCooperation,messageOrQuestionExample,question,taskExample');
                expect(rows[2]['REAL TIME']).to.equal('YES');

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
        })
    })

    it('Check perimeters export', function () {

        opfab.loginWithUser('admin');
        opfab.navigateToAdministration();

        //Click on tab "Perimeters"
        cy.get('#opfab-tabs').find('li').eq(3).click();

        // Do export
        cy.get('#opfab-admin-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^perimeter_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(8);

                expect(rows[0].ID).to.equal('conferenceAndITIncidentExample');
                expect(rows[0].PROCESS).to.equal('conferenceAndITIncidentExample');
                expect(rows[0]['STATE RIGHTS']).to.equal('{"state":"Conference Call ☏","right":"ReceiveAndWrite","filteringNotificationAllowed":true},{"state":"IT Incident","right":"ReceiveAndWrite","filteringNotificationAllowed":true}');

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
        })
    })

    function clickOnNthGroupTypeInDropdown(index) {
        cy.get('#opfab-group-type').click();
        cy.get('#opfab-group-type').find('.vscomp-option-text').eq(index).click();
        cy.get('#opfab-group-type').click();
    }
});
