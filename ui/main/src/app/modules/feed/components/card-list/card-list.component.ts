/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewChecked, Component, Input, OnInit, Output} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable, Subject} from 'rxjs';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from 'app/business/services/config.service';
import {MessageLevel} from '@ofModel/message.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {AcknowledgeService} from 'app/business/services/acknowledge.service';
import {UserService} from 'app/business/services/users/user.service';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {Router} from '@angular/router';
import {SortService} from 'app/business/services/lightcards/sort.service';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';

@Component({
    selector: 'of-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewChecked, OnInit {
    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;
    @Input() public totalNumberOfLightsCards: number;

    @Output() showFilters = new Subject<boolean>();

    modalRef: NgbModalRef;
    hideAckAllCardsFeature: boolean;
    ackAllCardsDemandTimestamp: number;
    currentUserWithPerimeters: UserWithPerimeters;

    hideResponseFilter: boolean;
    hideTimerTags: boolean;
    hideApplyFiltersToTimeLineChoice: boolean;
    defaultSorting: string;
    defaultAcknowledgmentFilter: string;


    filterActive: boolean;
    filterOpen: boolean;

    constructor(
        private modalService: NgbModal,
        private configService: ConfigService,
        private processesService: ProcessesService,
        private acknowledgeService: AcknowledgeService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private groupedCardsService: GroupedCardsService,
        private alertMessageService: AlertMessageService,
        private router: Router,
        private sortService: SortService,
        private userPreferences: UserPreferencesService,
        private lightCardsStoreService: LightCardsStoreService,
    ) {
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
    }

    ngOnInit(): void {
        this.defaultSorting = this.configService.getConfigValue('feed.defaultSorting', 'unread');

        this.sortService.setSortBy(this.defaultSorting);

        this.defaultAcknowledgmentFilter = this.configService.getConfigValue('feed.defaultAcknowledgmentFilter', 'notack');
        if (
            this.defaultAcknowledgmentFilter !== 'ack' &&
            this.defaultAcknowledgmentFilter !== 'notack' &&
            this.defaultAcknowledgmentFilter !== 'all'
        )
            this.defaultAcknowledgmentFilter = 'notack';

        this.hideTimerTags = this.configService.getConfigValue('feed.card.hideTimeFilter', false);
        this.hideResponseFilter = this.configService.getConfigValue('feed.card.hideResponseFilter', false);
        this.hideApplyFiltersToTimeLineChoice = this.configService.getConfigValue(
            'feed.card.hideApplyFiltersToTimeLineChoice',
            false
        );

        this.hideAckAllCardsFeature = this.configService.getConfigValue('feed.card.hideAckAllCardsFeature', true);
        this.initFilterActive();
    }



    ngAfterViewChecked() {
        this.adaptFrameHeight();
    }

    adaptFrameHeight() {
        const domCardListElement = document.getElementById('opfab-card-list');
        if (domCardListElement) {
            const rect = domCardListElement.getBoundingClientRect();
            let height = window.innerHeight - rect.top - 50;
            if (this.hideAckAllCardsFeature) height = window.innerHeight - rect.top - 10;
            domCardListElement.style.maxHeight = `${height}px`;
        }

        const domFiltersElement = document.getElementById('opfab-filters');
        if (domFiltersElement) {
            const rect = domFiltersElement.getBoundingClientRect();
            let height = window.innerHeight - rect.top - 45;
            if (this.hideAckAllCardsFeature) height = window.innerHeight - rect.top - 10;
            domFiltersElement.style.maxHeight = `${height}px`;
        }
    }

    initFilterActive() {
        const savedAlarm = this.userPreferences.getPreference('opfab.feed.filter.type.alarm');
        const savedAction = this.userPreferences.getPreference('opfab.feed.filter.type.action');
        const savedCompliant = this.userPreferences.getPreference('opfab.feed.filter.type.compliant');
        const savedInformation = this.userPreferences.getPreference('opfab.feed.filter.type.information');

        const alarmUnset = savedAlarm && savedAlarm !== 'true';
        const actionUnset = savedAction && savedAction !== 'true';
        const compliantUnset = savedCompliant && savedCompliant !== 'true';
        const informationUnset = savedInformation && savedInformation !== 'true';

        const responseValue = this.userPreferences.getPreference('opfab.feed.filter.response');
        const responseUnset = responseValue && responseValue !== 'true';

        const ackValue = this.userPreferences.getPreference('opfab.feed.filter.ack');
        const ackSet = ackValue && (ackValue === 'ack' || ackValue === 'none');


        const savedStart = this.userPreferences.getPreference('opfab.feed.filter.start');
        const savedEnd = this.userPreferences.getPreference('opfab.feed.filter.end');

        this.filterActive = alarmUnset || actionUnset || compliantUnset || informationUnset || responseUnset || ackSet || !!savedStart || !!savedEnd;
    }

    acknowledgeAllVisibleCardsInTheFeed() {
        this.lightCards.forEach((lightCard) => {
            this.acknowledgeVisibleCardInTheFeed(lightCard);
            this.groupedCardsService
                .getChildCardsByTags(lightCard.tags)
                .forEach((groupedCard) => this.acknowledgeVisibleCardInTheFeed(groupedCard));
        });
    }

    private acknowledgeVisibleCardInTheFeed(lightCard: LightCard): void {
        const processDefinition = this.processesService.getProcess(lightCard.process);
        if (
            !lightCard.hasBeenAcknowledged &&
            this.isCardPublishedBeforeAckDemand(lightCard) &&
            this.acknowledgeService.isAcknowledgmentAllowed(
                this.currentUserWithPerimeters,
                lightCard,
                processDefinition
            )
        ) {
            try {
                const entitiesAcks = [];
                const entities = this.entitiesService.getEntitiesFromIds(
                    this.currentUserWithPerimeters.userData.entities
                );
                entities.forEach((entity) => {
                    if (entity.entityAllowedToSendCard)
                        // this avoids to display entities used only for grouping
                        entitiesAcks.push(entity.id);
                });
                this.acknowledgeService.postUserAcknowledgement(lightCard.uid, entitiesAcks).subscribe((resp) => {
                    if (resp.status === ServerResponseStatus.OK) {
                        this.lightCardsStoreService.setLightCardAcknowledgment(lightCard.id, true);
                    } else {
                        throw new Error('the remote acknowledgement endpoint returned an error status(' + resp.status + ')');
                    }
                });
            } catch (err) {
                console.error(err);
                this.displayMessage('response.error.ack', null, MessageLevel.ERROR);
            }
        }
    }

    isCardPublishedBeforeAckDemand(lightCard: LightCard): boolean {
        return lightCard.publishDate < this.ackAllCardsDemandTimestamp;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.alertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    open(content) {
        this.ackAllCardsDemandTimestamp = Date.now();
        this.modalRef = this.modalService.open(content, {centered: true});
    }

    confirmAckAllCards() {
        this.modalRef.close();
        this.acknowledgeAllVisibleCardsInTheFeed();
        this.router.navigate(['/feed']);
    }

    declineAckAllCards(): void {
        this.modalRef.dismiss();
    }

    isCardInGroup(selected: string, id: string) {
        return this.groupedCardsService.isCardInGroup(selected, id);
    }

    onFilterActiveChange(active: boolean) {
        this.filterActive = active;
    }

    onShowFiltersAndSortChange(filterAndsort: any) {
        this.filterOpen = filterAndsort.filter;

        this.showFilters.next(this.filterOpen);
    }

    public isSmallscreen() {
        return window.innerWidth < 1000;
    }
}
