/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgePermission} from '@ofServices/acknowlegment/AcknowledgePermission';
import {CustomScreenDefinition, FieldType, Column} from '@ofServices/customScreen/model/CustomScreenDefinition';
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

export class TableRowBuilder {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly typeOfStateData = new Map<string, {text: string; value: string}>();

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

    public getRowFromCard(card: Card, childCards: Array<Card>, columns: Array<Column>): any {
        const data = {};
        columns.forEach((column) => {
            if (column.isFieldFromCurrentUserChildCard) {
                data[column.field] = this.getCurrentUserChildCardField(childCards, column);
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
                    data['responses'] = this.getResponses(card, childCards);
                    break;
                case FieldType.COLORED_CIRCLE:
                    data[column.field] = this.getColoredCircleValue(card, column.field);
                    break;
                case FieldType.RESPONSE_FROM_MY_ENTITIES:
                    data['responseFromMyEntities'] = card.hasChildCardFromCurrentUserEntity;
                    break;
                case FieldType.STATE_NAME:
                    data['stateName'] = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.name;
                    break;
                case FieldType.PROCESS_NAME:
                    data['processName'] = ProcessesService.getProcess(card.process)?.name;
                    break;
                case FieldType.STRING:
                    if (column.getValue) {
                        data[column.field] = column.getValue(card);
                    } else {
                        data[column.field] = this.getNestedField(card, column.cardField);
                    }
                    break;
                case FieldType.HTML:
                    data[column.field] = column.getValue(card);
                    break;

                default:
                    data[column.field] = this.getNestedField(card, column.cardField);
            }
        });
        data['cardId'] = card.id;
        if (this.customScreenDefinition.showAcknowledgmentButton)
            data['isAcknowledgmentPossible'] = this.isAcknowlegmentPossibleForCard(card);
        if (this.customScreenDefinition.responseButtons?.length > 0)
            data['isResponsePossible'] = this.isResponsePossibleForCard(card);
        return data;
    }

    private getDateAndTime(card: Card, field: string): {text: string; value: string} {
        const dateAndTime = this.getNestedField(card, field);

        return {
            text: DateTimeFormatterService.getFormattedDateAndTime(dateAndTime),
            value: dateAndTime.valueOf()
        };
    }

    private getCurrentUserChildCardField(childCards: Card[], column: Column): any {
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
            return {
                value: fieldValue,
                possibleValues: column.possibleValues
            };
        }
        return fieldValue;
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

    private getTypeOfState(card: Card): {text: string; value: string | undefined} {
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

    private isAcknowlegmentPossibleForCard(card: Card): boolean {
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
        const isUserAllowed = UserPermissionsService.isUserEnabledToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            card,
            ProcessesService.getProcess(card.process)
        );
        if (this.customScreenDefinition.responseOnlyAllowedForEntitiesRequiredToRespond) {
            return (
                isUserAllowed &&
                card.entitiesRequiredToRespond?.some((entity) =>
                    UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entity)
                )
            );
        }

        return isUserAllowed;
    }
}
