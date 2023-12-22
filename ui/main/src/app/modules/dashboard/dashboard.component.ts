/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {Dashboard} from 'app/business/view/dashboard/dashboard.view';
import {DashboardPage} from 'app/business/view/dashboard/dashboardPage';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';
@Component({
    selector: 'of-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;

    public dashboardPage : DashboardPage
    public dashboard: Dashboard;
    public modalRef: NgbModalRef;
    public openPopover: NgbPopover;
    public currentCircleHovered;
    public popoverTimeOut;

    constructor(
        private lightCardsStoreService: LightCardsStoreService,
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private modalService: NgbModal,
    ) {
        this.dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
    }

    ngOnInit(): void {
      this.dashboard.getDashboardPage().subscribe( (dashboardPage) => this.dashboardPage = dashboardPage  );
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    selectCard(info) {
        this.openPopover?.close();
        SelectedCardService.setSelectedCardId(info);
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }

    dashboardCircleHovered(myCircle, p): void {
        if (this.openPopover) {
            this.openPopover.close();
        }
        clearTimeout(this.popoverTimeOut);
        this.openPopover = p;
        this.currentCircleHovered = myCircle;
    }

    closePopover(timeUntilClosed): void {
        this.popoverTimeOut = setTimeout(() => {
            this.openPopover?.close();
        }, timeUntilClosed);
    }

    onCircleClick(circle) {
        this.openPopover?.close();
        if (circle.numberOfCards == 1) {
            const cardId = circle.cards[0].id;
            this.selectCard(cardId);
        }
    }

    onMouseEnter() {
        clearTimeout(this.popoverTimeOut);
    }
}
