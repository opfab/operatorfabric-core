/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {OpfabCommands} from './opfabCommands';

export class FeedCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('FEED');
    }


    checkNumberOfDisplayedCardsIs= function (nb) {
        cy.get('of-light-card').should('have.length', nb);
    }

    openFirstCard= function () {
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-div-card-template-processed');
    }

    openNthCard= function (nth) {
        cy.get('of-light-card').eq(nth).click();
        cy.get('#opfab-div-card-template-processed');
    }

    checkSelectedCardHasTitle= function (title) {
        cy.get('.light-card-detail-selected .card-title').should('have.text',title.toUpperCase());
    }

    checkSelectedCardHasSummary= function (summary) {
        cy.get('#opfab-selected-card-summary').should('have.text',summary);
    }

    checkLigthCardAtIndexHasTitle= function (index, title) {
        cy.get('.card-title').eq(index).should('have.text',title.toUpperCase())
    }

    deleteCurrentCard= function () {
        cy.get('#opfab-card-delete').click();
        cy.get('#opfab-card-details-delete-btn-confirm').click();
    }

    editCurrentCard= function () {
        cy.get('#opfab-card-edit').click();
        cy.get("of-usercard").should('exist');
    }

    copyCurrentCard= function () {
        cy.get('#opfab-card-create-copy').click();
        cy.get("of-usercard").should('exist');
    }

    sortByUnread= function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-sort-form').should('exist');
        cy.get('#opfab-feed-filter-unread').check();
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    sortByReceptionDate= function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-sort-form').should('exist');
        cy.get('#opfab-feed-filter-publication-date').check();
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    sortBySeverity= function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-sort-form').should('exist');
        cy.get('#opfab-feed-filter-severity').check();
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    sortByStartDate= function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-sort-form').should('exist');
        cy.get('#opfab-feed-filter-start-date').check();
        cy.get('#opfab-feed-filter-btn-filter').click();
    }


    sortByEndDate= function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-sort-form').should('exist');
        cy.get('#opfab-feed-filter-end-date').check();
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    toggleFilterByPriority = function (priorities) {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-type-filter-form').should('exist');
        priorities.forEach(priority => {
            cy.get('#opfab-feed-filter-severity-' + priority).click({force: true});
        });

        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    toggleFilterByResponse = function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-response-filter-form').should('exist');
        cy.get('#opfab-feed-filter-response').click({force: true});
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    toggleFilterByAcknowledgementAck = function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-ack-filter-form').should('exist');
        cy.get('#opfab-feed-filter-ack-ack').click({force: true});
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    toggleFilterByAcknowledgementNotAck = function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-ack-filter-form').should('exist');
        cy.get('#opfab-feed-filter-ack-notack').click({force: true});
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    toggleApplyFilterToTimeline = function () {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-timeline-filter-form').should('exist');
        cy.get('#opfab-feed-filter-timeline').click({force: true});
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    checkFilterIsActive= function() {
        cy.get('#opfab-feed-filter-btn-filter').should('have.class', 'opfab-icon-filter-active');
    }

    checkFilterIsNotActive= function() {
        cy.get('#opfab-feed-filter-btn-filter').should('have.class', 'opfab-icon-filter');
    }

    checkFilterIsOpenAndNotActive= function() {
        cy.get('#opfab-feed-filter-btn-filter').should('have.class', 'opfab-icon-filter-open');
    }

    checkFilterIsOpenAndActive= function() {
        cy.get('#opfab-feed-filter-btn-filter').should('have.class', 'opfab-icon-filter-open-active');
    }

    resetAllFilters() {
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-reset').click();
    }
}
