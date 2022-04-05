/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {takeUntil} from 'rxjs/operators';
import {TimeService} from '@ofServices/time.service';
import {Subject} from 'rxjs';
import {ConfigService} from '@ofServices/config.service';
import {AppService, PageType} from '@ofServices/app.service';
import {EntitiesService} from '@ofServices/entities.service';
import {ProcessesService} from '@ofServices/processes.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {ConsideredAcknowledgedForUserWhenEnum, TypeOfStateEnum} from '@ofModel/processes.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {UserService} from '@ofServices/user.service';
import {CardService} from '@ofServices/card.service';

@Component({
    selector: 'of-light-card',
    templateUrl: './light-card.component.html',
    styleUrls: ['./light-card.component.scss']
})
export class LightCardComponent implements OnInit, OnDestroy {

    @Input() public open = false;
    @Input() public lightCard: LightCard;
    @Input() public displayUnreadIcon = true;
    @Input() displayContext: any = DisplayContext.REALTIME;

    currentPath: any;
    protected _i18nPrefix: string;
    cardTitle: string;
    dateToDisplay: string;
    fromEntity = null;
    showExpiredIcon = true;
    showExpiredLabel = true;
    expiredLabel = 'feed.lttdFinished';
    consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;
    currentUserWithPerimeters: UserWithPerimeters;
    listEntitiesToAck: string[];
    entitiesAcksForThisCard: string[];
    displayAcknowledgedIcon = false;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    /* istanbul ignore next */
    constructor(
        private router: Router,
        private store: Store<AppState>,
        private time: TimeService,
        private configService: ConfigService,
        private _appService: AppService,
        private entitiesService: EntitiesService,
        private processesService: ProcessesService,
        private userService: UserService,
        private cardService: CardService) {
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
    }

    ngOnInit() {
        this._i18nPrefix = `${this.lightCard.process}.${this.lightCard.processVersion}.`;
        this.store
            .select(selectCurrentUrl)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((url) => {
                if (url) {
                    const urlParts = url.split('/');
                    this.currentPath = urlParts[1];
                }
            });
        this.computeFromEntity();
        this.computeDisplayedDate();
        this.computeLttdParams();

        this.processesService.queryProcess(this.lightCard.process, this.lightCard.processVersion).subscribe( process => {
            const state = process.extractState(this.lightCard);
            if (!! state.consideredAcknowledgedForUserWhen)
                this.consideredAcknowledgedForUserWhen = state.consideredAcknowledgedForUserWhen;
        });

        this.computeListEntitiesToAck();
        this.entitiesAcksForThisCard = ((!! this.lightCard.entitiesAcks) ? this.lightCard.entitiesAcks : []);

        this.cardService.getReceivedAcks().pipe(takeUntil(this.ngUnsubscribe)).subscribe(receivedAck => {
            if (receivedAck.cardUid === this.lightCard.uid)
                this.addAckFromSubscription(receivedAck.entitiesAcks);
        });

        this.doWeHaveToDisplayAcknowledgedIcon();
    }

    private computeListEntitiesToAck() {
        this.listEntitiesToAck = [];

        if (!! this.lightCard.entityRecipients) {
            const listOfEntityRecipients = this.entitiesService.getEntitiesFromIds(this.lightCard.entityRecipients);
            if (!! listOfEntityRecipients)
                this.entitiesService.resolveEntitiesAllowedToSendCards(listOfEntityRecipients).forEach(entityToAdd =>
                    this.listEntitiesToAck.push(entityToAdd.id)
                );
        }
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        if (!!this.listEntitiesToAck && this.listEntitiesToAck.length > 0) {
            entitiesAcksToAdd.forEach(entityAckToAdd => {
                this.entitiesAcksForThisCard.push(entityAckToAdd);
            });

            this.doWeHaveToDisplayAcknowledgedIcon();
        }
    }

    doWeHaveToDisplayAcknowledgedIcon(): void {

        this.displayAcknowledgedIcon = false;
        if (!! this.listEntitiesToAck)
            this.displayAcknowledgedIcon = (this.checkDisplayAckForTheCaseOfOneEntitySufficesForAck()
                                            || this.checkDisplayAckForTheCaseOfAllEntitiesMustAckTheCard());
    }

    checkDisplayAckForTheCaseOfOneEntitySufficesForAck(): boolean {

        if ((this.consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.ONE_ENTITY_OF_USER_HAS_ACKNOWLEDGED)
            && (!! this.entitiesAcksForThisCard)) {
            return (this.entitiesAcksForThisCard.filter(entityId =>
                this.currentUserWithPerimeters.userData.entities.includes(entityId)).length > 0);
        } else
            return false;
    }

    checkDisplayAckForTheCaseOfAllEntitiesMustAckTheCard(): boolean {

        if ((this.consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED)
             && (!! this.entitiesAcksForThisCard)) {

            // We compute the entities for which the ack is pending
            const entitiesWaitedForAck = this.listEntitiesToAck.filter(entityId =>
                this.entitiesAcksForThisCard.indexOf(entityId) < 0);

            const entitiesOfUserAndWaitedForAck = entitiesWaitedForAck.filter(entityId => {
                return this.entitiesService.isEntityAllowedToSendCard(entityId)
                       && this.currentUserWithPerimeters.userData.entities.includes(entityId);
            });
            return (entitiesOfUserAndWaitedForAck.length === 0);
        } else
            return false;
    }

    computeLttdParams() {
        this.processesService.queryProcess(this.lightCard.process, this.lightCard.processVersion).subscribe( process => {
            const state = process.extractState(this.lightCard);
            if (state.type === TypeOfStateEnum.FINISHED) {
                this.showExpiredIcon = false;
                this.showExpiredLabel = false;
            } else if (!!state.response) {
                this.showExpiredIcon = false;
                this.expiredLabel = 'feed.responsesClosed';
            }
        });
    }

    computeFromEntity() {
        if (this.lightCard.publisherType === 'ENTITY' )  this.fromEntity = this.entitiesService.getEntityName(this.lightCard.publisher);
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
                this.dateToDisplay = `${this.handleDate(this.lightCard.startDate)} - ${this.handleDate(this.lightCard.endDate)}`;
        }
    }

    handleDate(timeStamp: number): string {
        return this.time.formatDateTime(timeStamp);
    }

    public select() {
        if (this.displayContext != DisplayContext.PREVIEW)
            this.router.navigate(['/' + this.currentPath, 'cards', this.lightCard.id]);
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

    isArchivePageType(): boolean {
        return this._appService.pageType === PageType.ARCHIVE;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
