/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgePermission} from '@ofServices/acknowlegment/AcknowledgePermission';
import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {UsersService} from '@ofServices/users/UsersService';
import {Card} from 'app/model/Card';
import {PublisherType} from 'app/model/PublisherType';
import {Severity} from 'app/model/Severity';
import {getTypeOfStateColor} from 'app/utils/TypeOfStateUtil';
import {ResultTableCell} from './ResultTableCell';
import {CardListScreenDefinition, Column, FieldType} from '@ofServices/customScreen/model/CardListScreenDefinition';

export class TableRowBuilder {
    private readonly cardListScreenDefinition: CardListScreenDefinition;
    private readonly typeOfStateTranslation = new Map<string, string>();

    constructor(cardListScreenDefinition: CardListScreenDefinition) {
        this.cardListScreenDefinition = cardListScreenDefinition;

        // for performance reasons, we store the translation of the type of state in a map
        // this is to avoid calling the translation service for each row in the table
        this.typeOfStateTranslation.set(
            TypeOfStateEnum.CANCELED,
            TranslationService.getTranslation('shared.typeOfState.CANCELED')
        );
        this.typeOfStateTranslation.set(
            TypeOfStateEnum.FINISHED,
            TranslationService.getTranslation('shared.typeOfState.FINISHED')
        );
        this.typeOfStateTranslation.set(
            TypeOfStateEnum.INPROGRESS,
            TranslationService.getTranslation('shared.typeOfState.INPROGRESS')
        );
    }

    public getRowFromCard(card: Card, childCards: Array<Card>, columns: Array<Column>): any {
        const data = {};
        columns.forEach((column) => {
            if (column.isFieldFromCurrentUserChildCard) {
                data[column.field] = this.getCurrentUserChildCardCell(childCards, column);
                return;
            }
            switch (column.fieldType) {
                case FieldType.BUSINESS_PERIOD:
                    data[column.field] = this.getBusinessPeriodCell(card);
                    break;
                case FieldType.PUBLISHER:
                    data[column.field] = this.getPublisherCell(card);
                    break;
                case FieldType.DATE_AND_TIME:
                    data[column.field] = this.getDateAndTimeCell(card, column.cardField);
                    break;
                case FieldType.TYPE_OF_STATE:
                    data['typeOfState'] = this.getTypeOfStateCell(card, childCards);
                    break;
                case FieldType.RESPONSES:
                    data['responses'] = this.getResponsesCell(card, childCards);
                    break;
                case FieldType.COLORED_CIRCLE:
                    data[column.field] = this.getColoredCircleCell(card, column.field);
                    break;
                case FieldType.RESPONSE_FROM_MY_ENTITIES:
                    data['responseFromMyEntities'] = card.hasChildCardFromCurrentUserEntity;
                    break;
                case FieldType.ACKNOWLEDGMENT:
                    data['hasBeenAcknowledged'] = card.hasBeenAcknowledged;
                    break;
                case FieldType.STATE_NAME:
                    data['stateName'] = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.name;
                    break;
                case FieldType.PROCESS_NAME:
                    data['processName'] = ProcessesService.getProcess(card.process)?.name;
                    break;
                case FieldType.NUMBER_ARRAY:
                    data[column.field] = this.getNumberArrayCell(card, column);
                    break;
                case FieldType.PERIOD_ARRAY:
                    data[column.field] = this.getPeriodArrayCell(card, column);
                    break;
                case FieldType.NUMBER:
                case FieldType.STRING:
                    if (column.getValue) {
                        data[column.field] = column.getValue(card);
                    } else {
                        data[column.field] = this.getNestedField(card, column.cardField);
                    }
                    break;
                case FieldType.HTML:
                    data[column.field] = this.getHTMLCell(card, column);
                    break;
                default:
                    data[column.field] = this.getNestedField(card, column.cardField);
            }
        });
        data['cardId'] = card.id;
        if (this.cardListScreenDefinition.showAcknowledgmentButton)
            data['isAcknowledgmentPossible'] = this.isAcknowledgmentPossibleForCard(card);
        if (this.cardListScreenDefinition.responseButtons?.length > 0)
            data['isResponsePossible'] = this.isResponsePossibleForCard(card);
        return data;
    }

    private getBusinessPeriodCell(card: Card): ResultTableCell {
        const stringValue =
            DateTimeFormatterService.getFormattedDateAndTime(card.startDate) +
            ' - ' +
            (DateTimeFormatterService.getFormattedDateAndTime(card.endDate) ?? '');

        const htmlValue =
            '<div class="opfab-no-extra-line-spacing">' +
            DateTimeFormatterService.getFormattedDateAndTime(card.startDate) +
            ' <br> ' +
            (DateTimeFormatterService.getFormattedDateAndTime(card.endDate) ?? '') +
            '</div>';

        return {
            stringValue,
            htmlValue,
            value: {startDate: card.startDate.valueOf(), endDate: card.endDate?.valueOf()}
        };
    }

    private getDateAndTimeCell(card: Card, field: string): ResultTableCell {
        const dateAndTime = this.getNestedField(card, field);

        return {
            stringValue: DateTimeFormatterService.getFormattedDateAndTime(dateAndTime),
            value: dateAndTime.valueOf()
        };
    }

    private getCurrentUserChildCardCell(childCards: Card[], column: Column): ResultTableCell | string {
        let fieldValue = '';
        if (childCards && childCards.length > 0) {
            const userEntities = UsersService.getCurrentUserWithPerimeters().userData?.entities;
            for (const childCard of childCards) {
                if (userEntities.includes(childCard.publisher)) {
                    fieldValue = this.getNestedField(childCard, column.cardField);
                    break;
                }
            }
        }

        if (column.fieldType === FieldType.SELECT) {
            const stringValue =
                column.possibleValues?.find((value: any) => value.value === fieldValue)?.label ?? fieldValue;

            return {
                value: fieldValue,
                possibleValues: column.possibleValues,
                allowNewOptionForSelect: column.allowNewOptionForSelect,
                stringValue
            };
        }
        return fieldValue;
    }

    private getPublisherCell(card: Card): ResultTableCell {
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

    private getTypeOfStateCell(card: Card, childCards: Card[]): ResultTableCell {
        const typeOfState = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.type;
        const color = getTypeOfStateColor(typeOfState, card, childCards);
        if (typeOfState) {
            return {
                stringValue: this.typeOfStateTranslation.get(typeOfState),
                value: typeOfState,
                color
            };
        } else return {stringValue: '', value: undefined, color};
    }

    private getResponsesCell(card: Card, childCards: Array<Card>): ResultTableCell {
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
                entityName: entity.name,
                color
            });
        });
        entities.sort((a, b) => a.entityName?.localeCompare(b.entityName));
        return {value: entities};
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

    private getColoredCircleCell(card: Card, field: string): ResultTableCell {
        const value = this.cardListScreenDefinition.results.columns.find((col) => col.field === field).getValue(card);
        return {value: value.numericalValue, color: value.color};
    }

    private getNumberArrayCell(card: Card, column: Column): ResultTableCell {
        let htmlValue = '';
        let value = '';
        if (column.getValue) value = column.getValue(card);
        else {
            value = this.getNestedField(card, column.cardField);
        }
        if (Array.isArray(value)) {
            htmlValue = value.join('<br/>');
        }
        return {value, htmlValue};
    }

    private getHTMLCell(card: Card, column: Column): ResultTableCell {
        let htmlValue = '';
        let value = '';
        if (column.getHTMLValue) htmlValue = column.getHTMLValue(card);
        if (column.getValue) value = column.getValue(card);
        else {
            value = this.getNestedField(card, column.cardField);
        }
        return {value, htmlValue};
    }
    private getPeriodArrayCell(card: Card, column: Column): ResultTableCell {
        let htmlValue = '';
        let stringValue = '';
        let value = '';
        if (column.getValue) value = column.getValue(card);
        else {
            value = this.getNestedField(card, column.cardField);
        }
        if (Array.isArray(value)) {
            for (const period of value) {
                const start = DateTimeFormatterService.getFormattedDateAndTime(period.startDate);
                const end = DateTimeFormatterService.getFormattedDateAndTime(period.endDate);
                stringValue += start + ' - ' + (end ?? '') + ',';
                htmlValue += '<div class="opfab-no-extra-line-spacing">' + start + '<br/>' + (end ?? '') + '</div>';
            }
        }
        if (stringValue.endsWith(',')) stringValue = stringValue.slice(0, -1);

        return {value, stringValue, htmlValue};
    }

    private isAcknowledgmentPossibleForCard(card: Card): boolean {
        return AcknowledgePermission.isAcknowledgmentAllowed(
            UsersService.getCurrentUserWithPerimeters(),
            card,
            ProcessesService.getProcess(card.process)
        );
    }

    private isResponsePossibleForCard(card: Card): boolean {
        if (!card) {
            return false;
        }
        if (!this.isResponsePossibleForProcessState(card)) {
            return false;
        }
        const isUserAllowed = UserPermissionsService.isUserEnabledToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            card,
            ProcessesService.getProcess(card.process)
        );
        if (this.cardListScreenDefinition.responseOnlyAllowedForEntitiesRequiredToRespond) {
            return (
                isUserAllowed &&
                card.entitiesRequiredToRespond?.some((entity) =>
                    UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entity)
                )
            );
        }

        return isUserAllowed;
    }

    private isResponsePossibleForProcessState(card: Card): boolean {
        if (!this.cardListScreenDefinition.responsePossibleOnlyForProcessStates) return true;

        const processStates = this.cardListScreenDefinition.responsePossibleOnlyForProcessStates.find(
            (item) => item.process === card.process
        );
        if (!processStates) return false;

        return processStates.states.includes(card.state);
    }
}
