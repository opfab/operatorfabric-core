/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {ConfigService} from 'app/services/config/ConfigService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {DisplayContext} from '@ofModel/template.model';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';
import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {SoundNotificationService} from '@ofServices/notifications/SoundNotificationService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {MapService} from 'app/business/services/map.service';
import {TranslateService} from '@ngx-translate/core';
import {RouterStore} from 'app/business/store/router.store';
import {Utilities} from 'app/business/common/utilities';
import {SelectedCardStore} from 'app/business/store/selectedCard.store';

@Component({
    selector: 'of-light-card',
    templateUrl: './light-card.component.html',
    styleUrls: ['./light-card.component.scss']
})
export class LightCardComponent implements OnInit, OnDestroy {
    @Input() public open = false;
    @Input() public groupedCardOpen = false;
    @Input() public selection: Observable<string>;
    @Input() public lightCard: LightCard;
    @Input() public displayUnreadIcon = true;
    @Input() displayContext: any = DisplayContext.REALTIME;

    protected _i18nPrefix: string;
    dateToDisplay: string;
    truncatedTitle: string;
    fromEntity = null;
    showExpiredLabel = true;
    expiredLabel = 'feed.lttdFinished';
    expirationDateToDisplay: string;

    showGroupedCardsIcon = false;
    groupedCardsVisible = true;
    hasGeoLocation;
    isGeoMapEnabled;

    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private readonly router: Router,
        private readonly translateService: TranslateService
    ) {}

    ngOnInit() {
        this._i18nPrefix = `${this.lightCard.process}.${this.lightCard.processVersion}.`;
        GroupedCardsService.computeEvent
            .pipe(takeUntil(this.ngUnsubscribe))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((x) => this.computeGroupedCardsIcon());
        this.computeFromEntity();
        this.computeDisplayedDate();
        this.computeLttdParams();
        this.computeDisplayedExpirationDate();
        this.truncatedTitle = Utilities.sliceForFormat(this.lightCard.titleTranslated, 130);
        this.hasGeoLocation = !!this.lightCard?.wktGeometry?.length;
        this.isGeoMapEnabled = ConfigService.getConfigValue('feed.geomap.enableMap', false);
    }

    computeLttdParams() {
        ProcessesService.queryProcess(this.lightCard.process, this.lightCard.processVersion).subscribe((process) => {
            const state = process.states.get(this.lightCard.state);
            if (state.type === TypeOfStateEnum.FINISHED) {
                this.showExpiredLabel = false;
            } else if (state.response) {
                this.expiredLabel = 'feed.responsesClosed';
            }
        });
    }

    computeFromEntity() {
        if (this.lightCard.publisherType === 'ENTITY')
            this.fromEntity = EntitiesService.getEntityName(this.lightCard.publisher);
        else this.fromEntity = null;
    }

    computeDisplayedDate() {
        switch (ConfigService.getConfigValue('feed.card.time.display', 'BUSINESS')) {
            case 'NONE':
                this.dateToDisplay = '';
                break;
            case 'LTTD':
                this.dateToDisplay = this.handleDate(this.lightCard.lttd);
                break;
            case 'PUBLICATION':
                this.dateToDisplay = this.handleDate(this.lightCard.publishDate);
                break;
            case 'BUSINESS_START':
                this.dateToDisplay = this.handleDate(this.lightCard.startDate);
                break;
            default:
                this.dateToDisplay = `${this.handleDate(this.lightCard.startDate)} - ${this.handleDate(
                    this.lightCard.endDate
                )}`;
        }
    }

    computeDisplayedExpirationDate() {
        this.expirationDateToDisplay = `${this.translateService.instant('feed.tips.expirationDate')}: ${this.handleDate(
            this.lightCard.expirationDate
        )}`;
    }

    private computeGroupedCardsIcon() {
        this.showGroupedCardsIcon =
            GroupedCardsService.isParentGroupCard(this.lightCard) &&
            GroupedCardsService.getChildCardsByTags(this.lightCard.tags).length !== 0;
    }

    getGroupedChildCards() {
        return GroupedCardsService.getChildCardsByTags(this.lightCard.tags);
    }

    handleDate(timeStamp: number): string {
        return DateTimeFormatterService.getFormattedDateAndTime(timeStamp);
    }

    public select($event) {
        $event.stopPropagation();
        // Fix for https://github.com/opfab/operatorfabric-core/issues/2994
        SoundNotificationService.clearOutstandingNotifications();
        if (this.open && GroupedCardsService.isParentGroupCard(this.lightCard)) {
            this.groupedCardsVisible = !this.groupedCardsVisible;
        } else {
            this.groupedCardsVisible = true;
        }
        if (this.displayContext !== DisplayContext.PREVIEW)
            this.router.navigate([
                '/' + RouterStore.getCurrentRoute().split('/')[1].split('?')[0],
                'cards',
                this.lightCard.id
            ]);
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    highlightOnMap(highlight: boolean) {
        if (this.isGeoMapEnabled) {
            MapService.highlightOnMap(highlight, this.lightCard);
        }
    }

    zoomToLocation($event) {
        $event.stopPropagation();
        // Fix for https://github.com/opfab/operatorfabric-core/issues/2994
        SoundNotificationService.clearOutstandingNotifications();
        if (SelectedCardStore.getSelectedCardId()) {
            SelectedCardStore.clearSelectedCardId();
            this.router.navigate(['/feed'], {queryParams: {zoomToLocation: this.lightCard.id}});
        } else MapService.zoomToLocation(this.lightCard);
    }
}
