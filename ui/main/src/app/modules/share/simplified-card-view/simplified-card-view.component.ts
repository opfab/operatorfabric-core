/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from 'app/business/services/processes.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UserService} from '@ofServices/user.service';
import {User} from '@ofModel/user.model';
import {EntitiesService} from '@ofServices/entities.service';
import {State} from '@ofModel/processes.model';
import {DisplayContext} from '@ofModel/templateGateway.model';

declare const templateGateway: any;

@Component({
    selector: 'of-simplified-card-view',
    templateUrl: './simplified-card-view.component.html'
})
export class SimplifiedCardViewComponent implements OnInit, OnDestroy {
    @Input() card: Card;
    @Input() screenSize = 'md';
    @Input() displayContext: DisplayContext;
    @Input() childCards: Card[] = [];

    public cardState: State;
    public active = false;
    unsubscribe$: Subject<void> = new Subject<void>();
    private user: User;
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    public isLoading = true;
    public fixedBottomOffset = 90;

    constructor(
        private businessconfigService: ProcessesService,
        private userService: UserService,
        private entitiesService: EntitiesService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {
        this.computeEntitiesForResponses();
        this.getTemplateAndStyle();
    }

    private computeEntitiesForResponses() {
        const entityIdsRequiredToRespondAndAllowedToSendCards =
            this.getEntityIdsRequiredToRespondAndAllowedToSendCards();
        const userEntitiesRequiredToRespondAndAllowedToSendCards =
            entityIdsRequiredToRespondAndAllowedToSendCards.filter((entityId) => this.user.entities.includes(entityId));
        this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards =
            userEntitiesRequiredToRespondAndAllowedToSendCards.length > 0;
    }

    private getEntityIdsRequiredToRespondAndAllowedToSendCards() {
        if (!this.card.entitiesRequiredToRespond) return [];
        const entitiesAllowedToRespond = this.entitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);
        return this.entitiesService
            .resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond)
            .map((entity) => entity.id);
    }

    private getTemplateAndStyle() {
        this.businessconfigService
            .queryProcess(this.card.process, this.card.processVersion)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (businessconfig) => {
                    if (!!businessconfig) {
                        this.cardState = businessconfig.extractState(this.card);
                        this.isLoading = false;
                    }
                },
                error: (error) =>
                    console.log(
                        `something went wrong while trying to fetch process for ${this.card.process}` +
                            ` with ${this.card.processVersion} version, error = ${error}`
                    )
            });
    }

    public beforeTemplateRendering() {
        templateGateway.userMemberOfAnEntityRequiredToRespond =
            this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards;
        templateGateway.childCards = this.childCards;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
