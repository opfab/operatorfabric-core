/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Dashboard} from 'app/business/view/dashboard/dashboard.view';
import {DashboardPage} from 'app/business/view/dashboard/dashboardPage';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {Router} from '@angular/router';
import {ConfigService} from 'app/business/services/config.service';
import {TimelineButtonsComponent} from '../share/timeline-buttons/timeline-buttons.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgFor, NgClass} from '@angular/common';
import {CardComponent} from '../card/card.component';
@Component({
    selector: 'of-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: true,
    imports: [TimelineButtonsComponent, TranslateModule, NgIf, NgFor, NgClass, NgbPopover, CardComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;

    public dashboardPage: DashboardPage;
    public dashboard: Dashboard;
    public modalRef: NgbModalRef;
    public openPopover: NgbPopover;
    public currentCircleHovered;
    public popoverTimeOut;
    private hideProcessFilter: boolean;
    private hideStateFilter: boolean;

    constructor(
        private modalService: NgbModal,
        private router: Router
    ) {
        this.dashboard = new Dashboard();
    }

    ngOnInit(): void {
        this.dashboard.getDashboardPage().subscribe((dashboardPage) => (this.dashboardPage = dashboardPage));
        this.hideProcessFilter = ConfigService.getConfigValue('feed.card.hideProcessFilter', false);
        this.hideStateFilter = ConfigService.getConfigValue('feed.card.hideStateFilter', false);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
        this.dashboard.destroy();
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
        if (circle.numberOfCards === 1) {
            const cardId = circle.cards[0].id;
            this.selectCard(cardId);
        }
    }

    onMouseEnter() {
        clearTimeout(this.popoverTimeOut);
    }

    onProcessClick(processId: string) {
        if (!this.hideProcessFilter) this.router.navigate(['/feed'], {queryParams: {processFilter: processId}});
    }

    onStateClick(processId: string, stateId: string) {
        if (!this.hideProcessFilter && !this.hideStateFilter)
            this.router.navigate(['/feed'], {queryParams: {processFilter: processId, stateFilter: stateId}});
    }
}
