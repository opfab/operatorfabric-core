/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, Input} from '@angular/core';
import {Dashboard} from 'app/components/dashboard/view/DashboardView';
import {DashboardPage, TileCell} from 'app/components/dashboard/view/DashboardPage';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {ConfigService} from 'app/services/config/ConfigService';
import {TimelineButtonsComponent} from '../share/timeline-buttons/TimelineButtonsComponent';
import {TranslateModule} from '@ngx-translate/core';
import {NgClass} from '@angular/common';
import {CardComponent} from '../card/CardComponent';
import {NavigationService} from '@ofServices/navigation/NavigationService';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {DashboardScreenDefinition} from '@ofServices/customScreen/model/DashboardScreenDefinition';

declare const opfab: any;

@Component({
    selector: 'of-dashboard',
    templateUrl: './DashboardComponent.html',
    styleUrls: ['./DashboardComponent.scss'],
    imports: [TimelineButtonsComponent, TranslateModule, NgClass, NgbPopover, CardComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
    private readonly modalService = inject(NgbModal);

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;

    public dashboardPage: DashboardPage;
    public dashboard: Dashboard;
    public modalRef: NgbModalRef;
    public openPopover: NgbPopover;
    public currentCircleHovered;
    public popoverTimeOut;
    private hideProcessFilter: boolean;
    private hideStateFilter: boolean;
    private processStateRedirects: any;
    @Input() customScreenId: string;

    ngOnInit(): void {
        this.dashboard = new Dashboard(this.customScreenId);
        this.dashboard.getDashboardPage().subscribe((dashboardPage) => (this.dashboardPage = dashboardPage));
        this.hideProcessFilter = ConfigService.getConfigValue('feed.card.hideProcessFilter', false);
        this.hideStateFilter = ConfigService.getConfigValue('feed.card.hideStateFilter', false);
        const dashboardScreenDefinition = CustomScreenService.getCustomScreenDefinition(
            this.customScreenId
        ) as DashboardScreenDefinition;
        this.processStateRedirects = dashboardScreenDefinition?.processStateRedirects ?? [];
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

    onTileTitleClick(tileId: string) {
        if (!this.hideProcessFilter) NavigationService.navigateToFeedWithProcessStateFilter(tileId, undefined);
    }

    onCellClick(tileId: string, cell: TileCell) {
        if (cell.type === 'customScreenLink') {
            NavigationService.navigateTo('customscreen/' + cell.id);
            return;
        }

        const redirect = this.processStateRedirects.filter(
            (redirect) => redirect.processId === tileId && redirect.stateId === cell.id
        );
        if (redirect?.length > 0) {
            if (redirect[0]?.screenId) {
                NavigationService.navigateTo('customscreen/' + redirect[0].screenId);
            } else if (redirect[0]?.menuId) {
                opfab.navigate.redirectToBusinessMenu(redirect[0].menuId, redirect[0].urlExtension);
            }
        } else if (!this.hideProcessFilter && !this.hideStateFilter) {
            NavigationService.navigateToFeedWithProcessStateFilter(tileId, cell.id);
        }
    }
}
