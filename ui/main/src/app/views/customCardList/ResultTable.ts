/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition, FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Card} from 'app/model/Card';
import {PublisherType} from 'app/model/PublisherType';
import {Severity} from 'app/model/Severity';

export class ResultTable {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private startDate: number;
    private endDate: number;

    constructor(customScreenDefinition: CustomScreenDefinition) {
        this.customScreenDefinition = customScreenDefinition;
    }

    public getColumnsDefinitionForAgGrid(): any[] {
        const agGridColumns = [];
        if (this.customScreenDefinition) {
            this.customScreenDefinition.results.columns.forEach((column) => {
                switch (column.fieldType) {
                    case FieldType.SEVERITY:
                        agGridColumns.push({
                            field: column.field,
                            headerName: '',
                            type: 'severity'
                        });
                        break;
                    case FieldType.TYPE_OF_STATE:
                        agGridColumns.push({
                            field: 'typeOfState',
                            headerName: column.headerName,
                            type: 'typeOfState',
                            flex: column.flex
                        });
                        break;
                    case FieldType.RESPONSES:
                        agGridColumns.push({
                            field: 'responses',
                            headerName: column.headerName,
                            type: 'responses',
                            flex: column.flex
                        });
                        break;
                    default:
                        agGridColumns.push({
                            field: column.field,
                            headerName: column.headerName,
                            type: 'default',
                            flex: column.flex
                        });
                }
            });
        }
        return agGridColumns;
    }

    public setBusinessDateFilter(startDate: number, endDate: number) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public getDataArrayFromCards(cards: Card[], childCards: Map<string, Array<Card>>): any[] {
        const dataArray = [];
        cards.forEach((card) => {
            if (!this.isCardInDateRange(card)) return;
            const data = {};
            this.customScreenDefinition.results.columns.forEach((column) => {
                switch (column.fieldType) {
                    case FieldType.PUBLISHER:
                        data[column.field] = this.getPublisherLabel(card);
                        break;
                    case FieldType.DATE_AND_TIME:
                        data[column.field] = DateTimeFormatterService.getFormattedDateAndTime(card[column.cardField]);
                        break;
                    case FieldType.TYPE_OF_STATE:
                        data['typeOfState'] = this.getTypeOfState(card);
                        break;
                    case FieldType.RESPONSES:
                        data['responses'] = this.getResponses(card, childCards.get(card.id));
                        break;
                    default:
                        data[column.field] = card[column.cardField];
                }
            });
            data['cardId'] = card.id;
            dataArray.push(data);
        });
        return dataArray;
    }

    private isCardInDateRange(card: Card): boolean {
        if (!this.startDate || !this.endDate) return true;
        if (card.startDate > this.endDate) return false;
        if (card.endDate) {
            return card.endDate >= this.startDate;
        }
        return card.startDate >= this.startDate;
    }

    private getPublisherLabel(card: Card): string {
        let publisherLabel = card.publisher;
        if (card.publisherType === PublisherType.ENTITY) {
            publisherLabel = EntitiesService.getEntityName(card.publisher);
        }
        if (card.representative) {
            if (card.representativeType === PublisherType.ENTITY) {
                publisherLabel += ` (${EntitiesService.getEntityName(card.representative)})`;
            } else publisherLabel += ` (${card.representative})`;
        }
        return publisherLabel;
    }

    private getTypeOfState(card: Card): string {
        return ProcessesService.getProcess(card.process)?.states?.get(card.state)?.type;
    }

    private getResponses(card: Card, childCards: Array<Card>): Array<any> {
        const entities = new Array();

        const entitiesAllowedOrRequiredToRespond = new Array();
        if (card.entitiesAllowedToRespond) {
            entitiesAllowedOrRequiredToRespond.push(...card.entitiesAllowedToRespond);
        }
        if (card.entitiesRequiredToRespond) {
            entitiesAllowedOrRequiredToRespond.push(...card.entitiesRequiredToRespond);
        }

        EntitiesService.resolveEntitiesAllowedToSendCards(
            EntitiesService.getEntitiesFromIds(entitiesAllowedOrRequiredToRespond)
        ).forEach((entity) => {
            let color = 'grey';
            if (childCards) {
                const childCard = childCards.find((childCard) => childCard.publisher === entity.id);
                if (childCard) {
                    color = this.getColorForSeverity(childCard.severity);
                }
            }

            entities.push({
                name: entity.name,
                color
            });
        });
        entities.sort((a, b) => a.name?.localeCompare(b.name));
        return entities;
    }

    private getColorForSeverity(severity: Severity): string {
        switch (severity) {
            case Severity.ALARM:
                return 'red';
            case Severity.ACTION:
                return 'orange';
            case Severity.COMPLIANT:
                return 'green';
            default:
                return 'blue';
        }
    }
}
