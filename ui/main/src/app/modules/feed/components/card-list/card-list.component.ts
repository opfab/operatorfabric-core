/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '@ofServices/config.service';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessage} from '@ofActions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ProcessesService} from '@ofServices/processes.service';
import {AppService} from '@ofServices/app.service';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {UserService} from '@ofServices/user.service';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesService} from '@ofServices/entities.service';



@Component({
    selector: 'of-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewChecked, OnInit {

    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;
    @Input() public totalNumberOfLightsCards: number;

    modalRef: NgbModalRef;
    hideAckAllCardsFeature: boolean;
    ackAllCardsDemandTimestamp: number;
    currentUserWithPerimeters: UserWithPerimeters;

    domCardListElement;

    constructor(private modalService: NgbModal,
                private configService: ConfigService,
                private store: Store<AppState>,
                private processesService: ProcessesService,
                private acknowledgeService: AcknowledgeService,
                private userService: UserService,
                private _appService: AppService,
                private entitiesService: EntitiesService) {
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
    }

    ngOnInit(): void {
        this.domCardListElement = document.getElementById('opfab-card-list');
        this.hideAckAllCardsFeature = this.configService.getConfigValue('feed.card.hideAckAllCardsFeature', true);
    }

    ngAfterViewChecked() {
        this.adaptFrameHeight();
    }

    adaptFrameHeight() {
        const rect = this.domCardListElement.getBoundingClientRect();
        let height = window.innerHeight - rect.top - 30;
        if (this.hideAckAllCardsFeature)
            height = window.innerHeight - rect.top - 10;
        this.domCardListElement.style.maxHeight = `${height}px`;
    }

    acknowledgeAllVisibleCardsInTheFeed() {
        this.lightCards.forEach(lightCard => {

            const processDefinition = this.processesService.getProcess(lightCard.process);

            if (! lightCard.hasBeenAcknowledged && this.isCardPublishedBeforeAckDemand(lightCard)
                && this.acknowledgeService.isAcknowledgmentAllowed(this.currentUserWithPerimeters, lightCard, processDefinition)) {
                try {
                    const entitiesAcks = [];
                    const entities = this.entitiesService.getEntitiesFromIds(this.currentUserWithPerimeters.userData.entities);
                    entities.forEach(entity => {
                        if (entity.entityAllowedToSendCard) // this avoids to display entities used only for grouping
                            entitiesAcks.push(entity.id);
                    });
                    this.acknowledgeService.acknowledgeCard(lightCard, entitiesAcks);
                } catch (err) {
                    console.error(err);
                    this.displayMessage('response.error.ack', null, MessageLevel.ERROR);
                }
            }
        });
    }

    isCardPublishedBeforeAckDemand(lightCard: LightCard): boolean {
        return lightCard.publishDate < this.ackAllCardsDemandTimestamp;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
    }

    open(content) {
        this.ackAllCardsDemandTimestamp = Date.now();
        this.modalRef = this.modalService.open(content, {centered: true});
    }

    confirmAckAllCards() {
        this.modalRef.close();
        this.acknowledgeAllVisibleCardsInTheFeed();
        this._appService.closeDetails();
    }

    declineAckAllCards(): void {
        this.modalRef.dismiss();
    }
}
