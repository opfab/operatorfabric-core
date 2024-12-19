/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UserService} from 'app/business/services/users/user.service';
import {User} from '@ofModel/user.model';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {State} from '@ofServices/processes/model/Processes';
import {DisplayContext} from '@ofModel/template.model';
import {LoggerService} from 'app/services/logs/LoggerService';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../spinner/spinner.component';
import {TemplateRenderingComponent} from '../template-rendering/template-rendering.component';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';

@Component({
    selector: 'of-simplified-card-view',
    templateUrl: './simplified-card-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, SpinnerComponent, TemplateRenderingComponent]
})
export class SimplifiedCardViewComponent implements OnInit, OnDestroy {
    @Input() card: Card;
    @Input() screenSize = 'md';
    @Input() displayContext: DisplayContext;
    @Input() childCards: Card[] = [];
    @Input() fixedBottomOffset = 30;

    public cardState: State;
    public active = false;
    unsubscribe$: Subject<void> = new Subject<void>();
    private readonly user: User;
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    public isLoading = true;

    constructor() {
        const userWithPerimeters = UserService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {
        CardTemplateGateway.setCard(this.card);
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
        const entitiesAllowedToRespond = EntitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);
        return EntitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond).map((entity) => entity.id);
    }

    private getTemplateAndStyle() {
        ProcessesService.queryProcess(this.card.process, this.card.processVersion)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (businessconfig) => {
                    if (businessconfig) {
                        this.cardState = businessconfig.states.get(this.card.state);
                        this.isLoading = false;
                    }
                },
                error: (error) =>
                    LoggerService.error(
                        `Something went wrong while trying to fetch process for ${this.card.process}` +
                            ` with ${this.card.processVersion} version, error = ${error}`
                    )
            });
    }

    public beforeTemplateRendering() {
        CardTemplateGateway.setUserMemberOfAnEntityRequiredToRespond(
            this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards
        );
        CardTemplateGateway.setChildCards(this.childCards ? this.childCards : []);
    }

    public afterTemplateRendering() {
        if (this.displayContext === DisplayContext.ARCHIVE) {
            CardTemplateGateway.sendResponseLockToTemplate();
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
