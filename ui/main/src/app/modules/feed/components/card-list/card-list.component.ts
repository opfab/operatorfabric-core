/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {CardService} from '@ofServices/card.service';
import {AlertMessage} from '@ofActions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {UpdateALightCard} from '@ofActions/light-card.actions';
import {AcknowledgmentAllowedEnum, Process} from '@ofModel/processes.model';
import {ProcessesService} from '@ofServices/processes.service';
import {AppService} from '@ofServices/app.service';


@Component({
    selector: 'of-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewChecked, OnInit {

    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;

    modalRef: NgbModalRef;
    hideAckAllCardsFeature: boolean;
    ackAllCardsDemandTimestamp: number;

    domCardListElement;

    constructor(private modalService: NgbModal,
                private configService: ConfigService,
                private cardService: CardService,
                private store: Store<AppState>,
                private processesService: ProcessesService,
                private _appService: AppService) { }

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
            if (! lightCard.hasBeenAcknowledged && this.isCardPublishedBeforeAckDemand(lightCard)
                && this.isAcknowledgmentAllowed(lightCard))
                this.acknowledgeCard(lightCard);
        });
    }

    isCardPublishedBeforeAckDemand(lightCard: LightCard): boolean {
        return lightCard.publishDate < this.ackAllCardsDemandTimestamp;
    }

    isAcknowledgmentAllowed(lightCard: LightCard): boolean {
        const processDefinition = this.processesService.getProcess(lightCard.process);
        if (!! processDefinition) {
            const lightCardState = Process.prototype.extractState.call(processDefinition, lightCard);

            if (!! lightCardState)
                return lightCardState.acknowledgmentAllowed !== AcknowledgmentAllowedEnum.NEVER;
        }
        return false;
    }

    acknowledgeCard(lightCard: LightCard) {
        this.cardService.postUserAcknowledgement(lightCard.uid).subscribe(resp => {
            if (resp.status === 201 || resp.status === 200) {
                this.updateAcknowledgementOnLightCard(lightCard, true);
            } else {
                console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                this.displayMessage('response.error.ack', null, MessageLevel.ERROR);
            }
        });
    }

    updateAcknowledgementOnLightCard(lightCard: LightCard, hasBeenAcknowledged: boolean) {
        const updatedLightCard = {...lightCard, hasBeenAcknowledged: hasBeenAcknowledged};
        this.store.dispatch(new UpdateALightCard({card: updatedLightCard}));
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
        this._appService.closeDetails('feed');
    }

    declineAckAllCards(): void {
        this.modalRef.dismiss();
    }
}
