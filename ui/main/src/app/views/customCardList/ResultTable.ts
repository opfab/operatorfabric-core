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
import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {UsersService} from '@ofServices/users/UsersService';
import {Card} from 'app/model/Card';
import {PublisherType} from 'app/model/PublisherType';
import {Severity} from 'app/model/Severity';

export class ResultTable {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly typeOfStateData = new Map<string, {text: string; value: string}>();

    private startDate: number;
    private endDate: number;
    private processIds = [];
    private typesOfState = [];
    private areCardsWithResponseFromMyEntitiesExcluded = false;
    private areCardsWithResponseFromAllEntitiesExcluded = false;

    constructor(customScreenDefinition: CustomScreenDefinition) {
        this.customScreenDefinition = customScreenDefinition;

        // for performance reasons, we store the translation of the type of state in a map
        // this is to avoid calling the translation service for each row in the table
        this.typeOfStateData.set(TypeOfStateEnum.CANCELED, {
            value: TypeOfStateEnum.CANCELED,
            text: TranslationService.getTranslation('shared.typeOfState.CANCELED')
        });
        this.typeOfStateData.set(TypeOfStateEnum.FINISHED, {
            value: TypeOfStateEnum.FINISHED,
            text: TranslationService.getTranslation('shared.typeOfState.FINISHED')
        });
        this.typeOfStateData.set(TypeOfStateEnum.INPROGRESS, {
            value: TypeOfStateEnum.INPROGRESS,
            text: TranslationService.getTranslation('shared.typeOfState.INPROGRESS')
        });
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
                    case FieldType.DATE_AND_TIME:
                        agGridColumns.push({
                            field: column.field,
                            headerName: column.headerName,
                            type: 'dateAndTime',
                            flex: column.flex
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
                    case FieldType.RESPONSE_FROM_MY_ENTITIES:
                        agGridColumns.push({
                            field: 'responseFromMyEntities',
                            headerName: '',
                            type: 'responseFromMyEntities'
                        });
                        break;
                    case FieldType.COLORED_CIRCLE:
                        agGridColumns.push({
                            field: column.field,
                            headerName: column.headerName,
                            type: 'coloredCircle',
                            flex: column.flex
                        });
                        break;
                    case FieldType.INPUT:
                        agGridColumns.push({
                            field: column.field,
                            headerName: column.headerName,
                            type: 'input',
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

    public setProcessFilter(processIds: string[]) {
        this.processIds = processIds;
    }

    public setTypesOfStateFilter(typesOfState: string[]) {
        this.typesOfState = typesOfState;
    }

    public excludeCardsWithResponseFromMyEntities() {
        this.areCardsWithResponseFromMyEntitiesExcluded = true;
    }

    public includeCardsWithResponseFromMyEntities() {
        this.areCardsWithResponseFromMyEntitiesExcluded = false;
    }

    public excludeCardsWithResponseFromAllEntities() {
        this.areCardsWithResponseFromAllEntitiesExcluded = true;
    }

    public includeCardsWithResponseFromAllEntities() {
        this.areCardsWithResponseFromAllEntitiesExcluded = false;
    }

    public getDataArrayFromCards(cards: Card[], childCards: Map<string, Array<Card>>): any[] {
        const dataArray = [];
        cards.forEach((card) => {
            if (!this.isCardInDateRange(card)) return;
            if (!this.isCardInProcessIds(card)) return;
            if (!this.isCardInTypesOfState(card)) return;
            if (this.areCardsWithResponseFromMyEntitiesExcluded && card.hasChildCardFromCurrentUserEntity) return;
            if (this.areCardsWithResponseFromAllEntitiesExcluded && this.doesAllEntitiesHaveResponded(card, childCards))
                return;
            const data = {};
            this.customScreenDefinition.results.columns.forEach((column) => {
                if (column.isFieldFromCurrentUserChildCard) {
                    data[column.field] = this.getCurrentUserChildCardField(childCards.get(card.id), column.cardField);
                    return;
                }
                switch (column.fieldType) {
                    case FieldType.PUBLISHER:
                        data[column.field] = this.getPublisherLabel(card);
                        break;
                    case FieldType.DATE_AND_TIME:
                        data[column.field] = this.getDateAndTime(card, column.cardField);
                        break;
                    case FieldType.TYPE_OF_STATE:
                        data['typeOfState'] = this.getTypeOfState(card);
                        break;
                    case FieldType.RESPONSES:
                        data['responses'] = this.getResponses(card, childCards.get(card.id));
                        break;
                    case FieldType.COLORED_CIRCLE:
                        data[column.field] = this.getColoredCircleValue(card, column.field);
                        break;
                    case FieldType.RESPONSE_FROM_MY_ENTITIES:
                        data['responseFromMyEntities'] = card.hasChildCardFromCurrentUserEntity;
                        break;
                    default:
                        data[column.field] = this.getNestedField(card, column.cardField);
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

    private isCardInProcessIds(card: Card): boolean {
        if (!this.processIds || this.processIds.length === 0) return true;
        return this.processIds.includes(card.process);
    }

    private isCardInTypesOfState(card: Card): boolean {
        if (!this.typesOfState || this.typesOfState.length === 0) return true;
        const type = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.type;
        if (!type) return false;
        return this.typesOfState.includes(type);
    }

    private getDateAndTime(card: Card, field: string): {text: string; value: string} {
        const dateAndTime = this.getNestedField(card, field);

        return {
            text: DateTimeFormatterService.getFormattedDateAndTime(dateAndTime),
            value: dateAndTime.valueOf()
        };
    }
    private doesAllEntitiesHaveResponded(card: Card, childCards: Map<string, Array<Card>>): boolean {
        const entitiesToRespond = new Set(
            card.entitiesRequiredToRespond?.length > 0
                ? card.entitiesRequiredToRespond
                : (card.entitiesAllowedToRespond ?? [])
        );
        if (entitiesToRespond.size === 0) return false;
        const respondedEntities = new Set(childCards.get(card.id)?.map((card) => card.publisher) ?? []);
        return Array.from(entitiesToRespond).every((entity) => respondedEntities.has(entity));
    }

    private getCurrentUserChildCardField(childCards: Card[], field: string): any {
        if (!childCards || childCards.length === 0) return '';
        const userEntities = UsersService.getCurrentUserWithPerimeters().userData?.entities;
        for (const childCard of childCards) {
            if (userEntities.includes(childCard.publisher)) {
                return this.getNestedField(childCard, field);
            }
        }
        return '';
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

    private getTypeOfState(card: Card): {text: string; value: string} {
        const typeOfState = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.type;
        if (typeOfState) return this.typeOfStateData.get(typeOfState) as {text: string; value: string};
        else return {text: '', value: undefined};
    }

    private getResponses(card: Card, childCards: Array<Card>): Array<any> {
        const entities = new Array();
        const entitiesForResponse = new Array();

        if (card.entitiesRequiredToRespond) {
            entitiesForResponse.push(...card.entitiesRequiredToRespond);
        } else if (card.entitiesAllowedToRespond) {
            entitiesForResponse.push(...card.entitiesAllowedToRespond);
        }

        EntitiesService.resolveEntitiesAllowedToSendCards(
            EntitiesService.getEntitiesFromIds(entitiesForResponse)
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

    private getNestedField(obj: any, path: string): any {
        if (!path) return '';
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    private getColoredCircleValue(card: Card, field: string): string {
        return this.customScreenDefinition.results.columns.find((col) => col.field === field).getValue(card);
    }
}
