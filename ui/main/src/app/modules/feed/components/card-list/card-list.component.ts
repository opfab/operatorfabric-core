/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewChecked, Component, Input, OnInit, Output} from '@angular/core';
import {CardAction, LightCard} from '@ofModel/light-card.model';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from 'app/services/config/ConfigService';
import {MessageLevel} from '@ofModel/message.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {AcknowledgeService} from 'app/business/services/acknowledge.service';
import {UserService} from 'app/business/services/users/user.service';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {Router} from '@angular/router';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {OpfabStore} from 'app/business/store/opfabStore';
import {RolesEnum} from '@ofModel/roles.model';
import {ModalService} from 'app/business/services/modal.service';
import {I18n} from '@ofModel/i18n.model';
import {FiltersComponent} from './filters/filters.component';
import {FeedFilterComponent} from './filters/feed-filter/feed-filter.component';
import {NgIf, NgFor, AsyncPipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {LightCardModule} from 'app/modules/share/light-card/light-card.module';

@Component({
    selector: 'of-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss'],
    standalone: true,
    imports: [FiltersComponent, FeedFilterComponent, NgIf, NgFor, LightCardModule, TranslateModule, AsyncPipe]
})
export class CardListComponent implements AfterViewChecked, OnInit {
    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;
    @Input() public totalNumberOfLightsCards: number;
    @Input() processFilter: string;
    @Input() stateFilter: string;

    @Output() showFilters = new Subject<boolean>();

    hideAckAllCardsFeature: boolean;
    ackAllCardsDemandTimestamp: number;
    currentUserWithPerimeters: UserWithPerimeters;

    hideResponseFilter: boolean;
    hideTimerTags: boolean;
    hideProcessFilter: boolean;
    hideStateFilter: boolean;
    hideApplyFiltersToTimeLineChoice: boolean;
    defaultSorting: string;
    defaultAcknowledgmentFilter: string;

    filterActive: boolean;
    filterOpen: boolean;

    private readonly filteredLightCardStore: FilteredLightCardsStore;

    constructor(private readonly router: Router) {
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.currentUserWithPerimeters = UserService.getCurrentUserWithPerimeters();
    }

    ngOnInit(): void {
        this.defaultSorting = ConfigService.getConfigValue('feed.defaultSorting', 'unread');

        this.filteredLightCardStore.setSortBy(this.defaultSorting);

        this.defaultAcknowledgmentFilter = ConfigService.getConfigValue('feed.defaultAcknowledgmentFilter', 'notack');
        if (
            this.defaultAcknowledgmentFilter !== 'ack' &&
            this.defaultAcknowledgmentFilter !== 'notack' &&
            this.defaultAcknowledgmentFilter !== 'all'
        )
            this.defaultAcknowledgmentFilter = 'notack';

        this.hideTimerTags = ConfigService.getConfigValue('feed.card.hideTimeFilter', false);
        this.hideResponseFilter = ConfigService.getConfigValue('feed.card.hideResponseFilter', false);
        this.hideProcessFilter = ConfigService.getConfigValue('feed.card.hideProcessFilter', false);
        this.hideStateFilter = ConfigService.getConfigValue('feed.card.hideStateFilter', false);
        this.hideApplyFiltersToTimeLineChoice = ConfigService.getConfigValue(
            'feed.card.hideApplyFiltersToTimeLineChoice',
            false
        );

        this.hideAckAllCardsFeature = ConfigService.getConfigValue('feed.card.hideAckAllCardsFeature', true);
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
        const savedAlarm = UserPreferencesService.getPreference('opfab.feed.filter.type.alarm');
        const savedAction = UserPreferencesService.getPreference('opfab.feed.filter.type.action');
        const savedCompliant = UserPreferencesService.getPreference('opfab.feed.filter.type.compliant');
        const savedInformation = UserPreferencesService.getPreference('opfab.feed.filter.type.information');

        const alarmUnset = savedAlarm && savedAlarm !== 'true';
        const actionUnset = savedAction && savedAction !== 'true';
        const compliantUnset = savedCompliant && savedCompliant !== 'true';
        const informationUnset = savedInformation && savedInformation !== 'true';

        const responseValue = UserPreferencesService.getPreference('opfab.feed.filter.response');
        const responseUnset = responseValue && responseValue !== 'true';

        const ackValue = UserPreferencesService.getPreference('opfab.feed.filter.ack');
        const ackSet = ackValue && (ackValue === 'ack' || ackValue === 'none');

        const savedStart = UserPreferencesService.getPreference('opfab.feed.filter.start');
        const savedEnd = UserPreferencesService.getPreference('opfab.feed.filter.end');

        this.filterActive =
            alarmUnset ||
            actionUnset ||
            compliantUnset ||
            informationUnset ||
            responseUnset ||
            ackSet ||
            !!savedStart ||
            !!savedEnd;
    }

    acknowledgeAllVisibleCardsInTheFeed() {
        this.lightCards.forEach((lightCard) => {
            this.acknowledgeVisibleCardInTheFeed(lightCard);
            GroupedCardsService.getChildCardsByTags(lightCard.tags).forEach((groupedCard) =>
                this.acknowledgeVisibleCardInTheFeed(groupedCard)
            );
        });
    }

    private acknowledgeVisibleCardInTheFeed(lightCard: LightCard): void {
        const processDefinition = ProcessesService.getProcess(lightCard.process);
        if (
            !lightCard.hasBeenAcknowledged &&
            this.isCardPublishedBeforeAckDemand(lightCard) &&
            AcknowledgeService.isAcknowledgmentAllowed(this.currentUserWithPerimeters, lightCard, processDefinition)
        ) {
            try {
                const entitiesAcks = [];
                const entities = EntitiesService.getEntitiesFromIds(this.currentUserWithPerimeters.userData.entities);
                entities.forEach((entity) => {
                    if (entity.roles?.includes(RolesEnum.CARD_SENDER))
                        // this avoids to display entities used only for grouping
                        entitiesAcks.push(entity.id);
                });
                AcknowledgeService.postUserAcknowledgement(lightCard.uid, entitiesAcks).subscribe((resp) => {
                    if (resp.status === ServerResponseStatus.OK) {
                        OpfabStore.getLightCardStore().setLightCardAcknowledgment(lightCard.id, true);
                        this.handleChildCardsUserAcknowledgement(lightCard.id, entitiesAcks);
                    } else {
                        throw new Error(
                            'the remote acknowledgement endpoint returned an error status(' + resp.status + ')'
                        );
                    }
                });
            } catch (err) {
                logger.error(JSON.stringify(err));
                this.displayMessage('response.error.ack', null, MessageLevel.ERROR);
            }
        }
    }

    private handleChildCardsUserAcknowledgement(cardId, entitiesAcks) {
        const childCards = OpfabStore.getLightCardStore().getChildCards(cardId);
        if (childCards) {
            childCards.forEach((child) => {
                if (child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                    AcknowledgeService.postUserAcknowledgement(child.uid, entitiesAcks).subscribe();
                }
            });
        }
    }

    isCardPublishedBeforeAckDemand(lightCard: LightCard): boolean {
        return lightCard.publishDate < this.ackAllCardsDemandTimestamp;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    clickOnAckAll() {
        ModalService.openConfirmationModal(
            new I18n('feed.acknowledgeAllCards.popup.title'),
            new I18n('feed.acknowledgeAllCards.popup.doYouReallyWant')
        ).then((confirm) => {
            if (confirm) this.confirmAckAllCards();
        });
        this.ackAllCardsDemandTimestamp = Date.now();
    }

    confirmAckAllCards() {
        this.acknowledgeAllVisibleCardsInTheFeed();
        this.router.navigate(['/feed']);
    }

    isCardInGroup(selected: string, id: string) {
        return GroupedCardsService.isCardInGroup(selected, id);
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
