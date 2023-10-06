/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {DisplayContext} from '@ofModel/template.model';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';
import {TypeOfStateEnum} from '@ofModel/processes.model';
import {SoundNotificationService} from 'app/business/services/notifications/sound-notification.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {MapService} from 'app/business/services/map.service';
import {TranslateService} from '@ngx-translate/core';
import {RouterStore} from 'app/business/store/router.store';
import {Utilities} from 'app/business/common/utilities';

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
    showExpiredIcon = true;
    showExpiredLabel = true;
    expiredLabel = 'feed.lttdFinished';
    expirationDateToDisplay: string;

    showGroupedCardsIcon = false;
    groupedCardsVisible = true;
    hasGeoLocation;
    isGeoMapEnabled;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private dateTimeFormatter: DateTimeFormatterService,
        private configService: ConfigService,
        private entitiesService: EntitiesService,
        private processesService: ProcessesService,
        private groupedCardsService: GroupedCardsService,
        private soundNotificationService: SoundNotificationService,
        private mapService: MapService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this._i18nPrefix = `${this.lightCard.process}.${this.lightCard.processVersion}.`;
        this.groupedCardsService.computeEvent
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((x) => this.computeGroupedCardsIcon());
        this.computeFromEntity();
        this.computeDisplayedDate();
        this.computeLttdParams();
        this.computeDisplayedExpirationDate();
        this.truncatedTitle = Utilities.sliceForFormat(this.lightCard.titleTranslated, 130);
        this.hasGeoLocation =
            this.lightCard.wktGeometry === undefined ||
            this.lightCard.wktGeometry == null ||
            this.lightCard.wktGeometry.length <= 0
                ? false
                : true;
        this.isGeoMapEnabled = this.configService.getConfigValue('feed.geomap.enableMap', false);
    }

    computeLttdParams() {
        this.processesService
            .queryProcess(this.lightCard.process, this.lightCard.processVersion)
            .subscribe((process) => {
                const state = process.states.get((this.lightCard.state));
                if (state.type === TypeOfStateEnum.FINISHED) {
                    this.showExpiredIcon = false;
                    this.showExpiredLabel = false;
                } else if (state.response) {
                    this.showExpiredIcon = false;
                    this.expiredLabel = 'feed.responsesClosed';
                }
            });
    }

    computeFromEntity() {
        if (this.lightCard.publisherType === 'ENTITY')
            this.fromEntity = this.entitiesService.getEntityName(this.lightCard.publisher);
        else this.fromEntity = null;
    }

    computeDisplayedDate() {
        switch (this.configService.getConfigValue('feed.card.time.display', 'BUSINESS')) {
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
        this.showGroupedCardsIcon = this.groupedCardsService.isParentGroupCard(this.lightCard)
        && this.groupedCardsService.getChildCardsByTags(this.lightCard.tags).length !== 0;
    }

    getGroupedChildCards() {
        return this.groupedCardsService.getChildCardsByTags(this.lightCard.tags);
    }

    handleDate(timeStamp: number): string {
        return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(timeStamp);
    }

    public select($event) {
        $event.stopPropagation();
        // Fix for https://github.com/opfab/operatorfabric-core/issues/2994
        this.soundNotificationService.clearOutstandingNotifications();
        if (this.open && this.groupedCardsService.isParentGroupCard(this.lightCard)) {
            this.groupedCardsVisible = !this.groupedCardsVisible;
        } else {
            this.groupedCardsVisible = true;
        }
        if (this.displayContext != DisplayContext.PREVIEW)
            this.router.navigate(['/' + RouterStore.getInstance().getCurrentRoute().split('/')[1], 'cards', this.lightCard.id]);
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
            this.mapService.highlightOnMap(highlight, this.lightCard);
        }
    }

    zoomToLocation($event) {
        $event.stopPropagation();
        // Fix for https://github.com/opfab/operatorfabric-core/issues/2994
        this.soundNotificationService.clearOutstandingNotifications();
        this.mapService.zoomToLocation(this.lightCard);
    }
}
