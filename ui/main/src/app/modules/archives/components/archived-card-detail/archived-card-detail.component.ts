/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Card} from "@ofModel/card.model";
import {DisplayContext} from "@ofModel/template.model";
import {DateTimeFormatterService} from "app/business/services/date-time-formatter.service";
import {EntitiesService} from "app/business/services/entities.service";
import {Utilities} from "../../../../business/common/utilities";

@Component({
    selector: 'of-archived-card-detail',
    templateUrl: './archived-card-detail.component.html',
    styleUrls: ['./archived-card-detail.component.scss']
})
export class ArchivedCardDetailComponent implements OnInit{

    fromEntityOrRepresentativeSelectedCard = null;
    entityRecipientsForFooter = '';
    entityRecipientsForInformationForFooter = '';

    displayContext: any = DisplayContext.ARCHIVE;

    @Input() card: Card;
    @Input() childCards: Card[];

    constructor(
        private dateTimeFormatter: DateTimeFormatterService,
        private translate: TranslateService,
        private entitiesService: EntitiesService,
    ) {
    }

    ngOnInit() {
        this.computeFromEntity();
        this.computeEntityRecipientsForFooter();
        this.computeEntityRecipientsForInformationForFooter();
    }


    private computeFromEntity() {
        if (this.card.publisherType === 'ENTITY') {
            this.fromEntityOrRepresentativeSelectedCard = this.entitiesService.getEntityName(
                this.card.publisher
            );

            if (this.card.representativeType && this.card.representative) {
                const representative =
                    this.card.representativeType === 'ENTITY'
                        ? this.entitiesService.getEntityName(this.card.representative)
                        : this.card.representative;

                this.fromEntityOrRepresentativeSelectedCard += ' (' + representative + ')';
            }
        } else this.fromEntityOrRepresentativeSelectedCard = null;
    }

    private computeEntityRecipientsForFooter() {
        const listOfEntityRecipients = [];
        this.entityRecipientsForFooter = '';

        if (this.card.entityRecipients) {
            const entityRecipientsForFooter = Utilities.removeElementsFromArray(this.card.entityRecipients, this.card.entityRecipientsForInformation);

            entityRecipientsForFooter.forEach((entityRecipient) => {
                listOfEntityRecipients.push(this.entitiesService.getEntityName(entityRecipient));
            });
        }
        listOfEntityRecipients.sort();

        listOfEntityRecipients.forEach((entityRecipient) => {
            this.entityRecipientsForFooter += ' ' + entityRecipient + ',';
        });
        if (this.entityRecipientsForFooter.length > 0) {
            this.entityRecipientsForFooter = this.translate.instant('feed.entityRecipients') +
                this.entityRecipientsForFooter.slice(0, -1); // we remove the last comma
        }
    }

    private computeEntityRecipientsForInformationForFooter() {
        const listOfEntityRecipientsForInformation = [];
        this.entityRecipientsForInformationForFooter = '';

        if (this.card.entityRecipientsForInformation) {
            this.card.entityRecipientsForInformation.forEach((entityRecipientForInformation) => {
                listOfEntityRecipientsForInformation.push(this.entitiesService.getEntityName(entityRecipientForInformation));
            });
        }
        listOfEntityRecipientsForInformation.sort();

        listOfEntityRecipientsForInformation.forEach((entityRecipientForInformation) => {
            this.entityRecipientsForInformationForFooter += ' ' + entityRecipientForInformation + ',';
        });
        if (this.entityRecipientsForInformationForFooter.length > 0) {
            this.entityRecipientsForInformationForFooter = this.translate.instant('feed.entityRecipientsForInformation') +
                this.entityRecipientsForInformationForFooter.slice(0, -1); // we remove the last comma
        }
    }

    getFormattedPublishDate(): any {
        return this.dateTimeFormatter.getFormattedDateFromEpochDate(this.card.publishDate);
    }

    getFormattedPublishTime(): any {
        return this.dateTimeFormatter.getFormattedTimeFromEpochDate(this.card.publishDate);
    }

    getFormattedDate(date: number): any {
        return this.dateTimeFormatter.getFormattedDateFromEpochDate(date);
    }

    getFormattedTime(date: number): any {
        return this.dateTimeFormatter.getFormattedTimeFromEpochDate(date);
    }

}