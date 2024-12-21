/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardAction, Severity} from '@ofModel/light-card.model';
import {CardBuilder} from './cardBuilder';
import {
    AlertMessageReceiver,
    getOneCard,
    initOpfabAPI,
    setEntities,
    setProcessConfiguration,
    setUserPerimeter
} from '@tests/helpers';
import {EditionMode, InputFieldName} from '../userCard.model';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {CardService} from 'app/business/services/card/card.service';
import {CardServerMock} from '@tests/mocks/cardServer.mock';
import {State} from '@ofServices/processes/model/Processes';
import {HourAndMinutes, Recurrence, TimeSpan} from '@ofModel/card.model';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {I18n} from '@ofModel/i18n.model';
import {setSpecificCardInformation} from '@tests/userCardView/helpers';

declare const opfab: any;

function getStringWithFirstLetterUpperCase(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

describe('UserCard CardBuilder', () => {
    let cardBuilder: CardBuilder;
    beforeEach(async () => {
        initOpfabAPI();
        cardBuilder = new CardBuilder();
        CardService.setCardServer(new CardServerMock());
        await setProcessConfiguration([
            {
                id: 'process1',
                version: 'v1',
                name: 'process name 1',
                states: new Map<string, State>([['state1_1', {name: 'State 1_1'}]])
            }
        ]);
    });
    describe('Error handling', () => {
        let alertMessageReceiver: AlertMessageReceiver;

        async function checkAlertMessage(i18nKey: string, message: string = undefined) {
            const card = await cardBuilder.getCard();
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual(i18nKey);
            expect(alertMessage.message).toEqual(message);
            expect(alertMessage.level).toEqual(MessageLevel.ERROR);
            expect(card).toBeUndefined();
        }

        beforeEach(() => {
            alertMessageReceiver = new AlertMessageReceiver();
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(50));
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('should display error if template does not return specific card information', async () => {
            opfab.currentUserCard.registerFunctionToGetSpecificCardInformation(() => null);
            await checkAlertMessage('userCard.error.templateError');
        });
        it('should display error message provided by template if specific information is not valid', async () => {
            setSpecificCardInformation({valid: false, errorMsg: 'error message'});
            await checkAlertMessage(undefined, 'error message');
        });
        it('should display error if specific information does not contain card field', async () => {
            setSpecificCardInformation({valid: true});
            await checkAlertMessage('userCard.error.templateError');
        });
        it('should display error if end date is before start date', async () => {
            setSpecificCardInformation({valid: true, card: {startDate: 100, endDate: 10}});
            await checkAlertMessage('shared.endDateBeforeStartDate');
        });
        it('should display error if lttd is before start date', async () => {
            setSpecificCardInformation({valid: true, card: {startDate: 100, lttd: 50}});
            await checkAlertMessage('userCard.error.lttdBeforeStartDate');
        });
        it('should display error if lttd is before current date', async () => {
            setSpecificCardInformation({valid: true, card: {startDate: 100, lttd: 40}});
            await checkAlertMessage('userCard.error.lttdBeforeStartDate');
        });
        it('should display error if lttd is after end date', async () => {
            setSpecificCardInformation({valid: true, card: {startDate: 100, endDate: 200, lttd: 300}});
            await checkAlertMessage('userCard.error.lttdAfterEndDate');
        });
        it('should display error if expiration date is before start date', async () => {
            setSpecificCardInformation({valid: true, card: {startDate: 100, expirationDate: 50}});
            await checkAlertMessage('userCard.error.expirationDateBeforeStartDate');
        });
    });
    describe('Severity', async () => {
        it('should be selected by user if severity visible', async () => {
            setSpecificCardInformation({valid: true, card: {severity: 'ACTION'}});
            cardBuilder.setFieldVisible(InputFieldName.Severity, true);
            cardBuilder.setSeveritySelectedByUser(Severity.ALARM);
            const card = await cardBuilder.getCard();
            expect(card.severity).toBe(Severity.ALARM);
        });
        it('should be severity provided by template if severity not visible', async () => {
            setSpecificCardInformation({valid: true, card: {severity: 'ACTION'}});
            cardBuilder.setFieldVisible(InputFieldName.Severity, false);
            const card = await cardBuilder.getCard();
            expect(card.severity).toBe(Severity.ACTION);
        });
        it('Should be INFORMATION if severity not visible and template does not provide severity', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setFieldVisible(InputFieldName.Severity, false);
            const card = await cardBuilder.getCard();
            expect(card.severity).toBe(Severity.INFORMATION);
        });
    });
    describe('KeepChildCards', async () => {
        it('should be selected by user if keepChildCards visible', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {actions: [CardAction.KEEP_CHILD_CARDS]}
            });
            cardBuilder.setFieldVisible(InputFieldName.KeepChildCards, true);
            const card = await cardBuilder.getCard();
            expect(card.actions).toEqual([]);
        });
        it('should be provided by template if keepChildCards not visible', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {actions: [CardAction.KEEP_CHILD_CARDS]}
            });
            cardBuilder.setFieldVisible(InputFieldName.KeepChildCards, false);
            const card = await cardBuilder.getCard();
            expect(card.actions).toEqual([CardAction.KEEP_CHILD_CARDS]);
        });
    });
    describe('States and process', () => {
        it('Should set state and process', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setProcessId('process1');
            cardBuilder.setStateId('state1');
            cardBuilder.setProcessVersion('version1');
            const card = await cardBuilder.getCard();
            expect(card.process).toBe('process1');
            expect(card.state).toBe('state1');
            expect(card.processVersion).toBe('version1');
        });
    });
    describe('Title ', () => {
        it('Should set title translated', async () => {
            setSpecificCardInformation({valid: true, card: {title: {key: 'titleKey', parameters: {myparam: 'test'}}}});
            cardBuilder.setProcessId('process1');
            cardBuilder.setStateId('state1');
            cardBuilder.setProcessVersion('version1');
            const card = await cardBuilder.getCard();
            expect(card.title).toEqual({key: 'titleKey', parameters: {myparam: 'test'}});
            expect(card.titleTranslated).toBe('Translation of titleKey for process process1 with version version1');
        });
    });
    describe('Fixed card values', () => {
        it('Should set fixed card values', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.publisherType).toEqual('ENTITY');
            expect(card.hasBeenAcknowledged).toEqual(false);
            expect(card.hasBeenRead).toEqual(false);
        });
    });
    describe('ProcessInstanceId', () => {
        it('Should set processInstanceId with a new uid ', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.processInstanceId.length).toBe(36);
        });
        it('Should generate each time different processInstanceId', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card1 = await cardBuilder.getCard();
            const card2 = await cardBuilder.getCard();
            expect(card1.processInstanceId).not.toBe(card2.processInstanceId);
        });
        it('Should use existing processInstanceId if editing a card', async () => {
            cardBuilder.setExistingCard(getOneCard({processInstanceId: '1234'}), EditionMode.EDITION);
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.processInstanceId).toBe('1234');
        });
        it('Should not use existing processInstanceId if copying card', async () => {
            cardBuilder.setExistingCard(getOneCard({processInstanceId: '1234'}), EditionMode.COPY);
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.processInstanceId.length).toBe(36);
        });
    });
    ['wktGeometry', 'wktProjection', 'tags'].forEach((field) =>
        describe(field, () => {
            it(`Should set ${field} from specific information`, async () => {
                setSpecificCardInformation({valid: true, card: {[field]: 'fieldValue'}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue');
            });
            it(`Should set empty ${field} if not provided by template`, async () => {
                setSpecificCardInformation({valid: true, card: {}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual(undefined);
            });
            it(`Should set ${field} from card to edit if not provided by template`, async () => {
                cardBuilder.setExistingCard(getOneCard({[field]: 'fieldValue'}));
                setSpecificCardInformation({valid: true, card: {}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue');
            });
            it(`Should not set ${field} from card to edit if provided by template`, async () => {
                cardBuilder.setExistingCard(getOneCard({[field]: 'fieldValue'}));
                setSpecificCardInformation({valid: true, card: {[field]: 'fieldValue2'}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue2');
            });
            it(`Should set ${field} from card to copy if not provided by template`, async () => {
                cardBuilder.setExistingCard(getOneCard({[field]: 'fieldValue'}));
                setSpecificCardInformation({valid: true, card: {}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue');
            });
            it(`Should not set ${field} from card to copy if provided by template`, async () => {
                cardBuilder.setExistingCard(getOneCard({[field]: 'fieldValue'}));
                setSpecificCardInformation({valid: true, card: {[field]: 'fieldValue2'}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue2');
            });
        })
    );
    [
        'data',
        'entitiesAllowedToEdit',
        'externalRecipients',
        'entitiesRequiredToRespond',
        'rRule',
        'secondsBeforeTimeSpanForReminder',
        'summary'
    ].forEach((field) =>
        describe(field, () => {
            it(`Should be set from specific card information`, async () => {
                setSpecificCardInformation({valid: true, card: {[field]: 'fieldValue'}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual('fieldValue');
            });
            it(`Should be undefined if not provided by template`, async () => {
                setSpecificCardInformation({valid: true, card: {}});
                const card = await cardBuilder.getCard();
                expect(card[field]).toEqual(undefined);
            });
        })
    );
    describe('actions', () => {
        it(`Should be set from specific card information`, async () => {
            setSpecificCardInformation({valid: true, card: {['actions']: [CardAction.KEEP_EXISTING_ACKS_AND_READS]}});
            const card = await cardBuilder.getCard();
            expect(card['actions']).toEqual([CardAction.KEEP_EXISTING_ACKS_AND_READS]);
        });
        it(`Should be empty if not provided by template`, async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card['actions']).toEqual([]);
        });
    });
    describe('Recipients', () => {
        it('Should be set from user if field visible', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual(['ENTITY1', 'ENTITY2']);
        });
        it('Should be set from template if field not visible', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipients: ['ENTITY3', 'ENTITY4']}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, false);
            cardBuilder.setRecipientsSelectedByUser([]);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual(['ENTITY3', 'ENTITY4']);
        });
        it('Should be the union of recipients from template and recipients from user if field is visible', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipients: ['ENTITY3', 'ENTITY4']}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2', 'ENTITY3']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3', 'ENTITY4']);
        });
        it('Should be empty if not visible and template does not provide it', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, false);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual([]);
        });
        it('Should add recipients for information to recipients if recipients information set by user', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipients: ['ENTITY1', 'ENTITY2']}});
            cardBuilder.setFieldVisible(InputFieldName.RecipientsForInformation, true);
            cardBuilder.setRecipientsForInformationSelectedByUser(['ENTITY3', 'ENTITY4']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3', 'ENTITY4']);
        });
    });
    describe('RecipientsForInformation', () => {
        it('Should be set from template if not visible', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipientsForInformation: ['ENTITY1', 'ENTITY2']}});
            cardBuilder.setFieldVisible(InputFieldName.RecipientsForInformation, false);
            cardBuilder.setRecipientsForInformationSelectedByUser([]);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipientsForInformation).toEqual(['ENTITY1', 'ENTITY2']);
        });
        it('Should be the union of recipientsForInformation from template and recipientsFromInformation from user if field is visible', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipientsForInformation: ['ENTITY3', 'ENTITY4']}});
            cardBuilder.setFieldVisible(InputFieldName.RecipientsForInformation, true);
            cardBuilder.setRecipientsForInformationSelectedByUser(['ENTITY1', 'ENTITY2', 'ENTITY3']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipientsForInformation).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3', 'ENTITY4']);
        });
        it('Should remove from recipientsForInformation set by template, recipients selected by user ', async () => {
            setSpecificCardInformation({valid: true, card: {entityRecipientsForInformation: ['ENTITY2', 'ENTITY3']}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipientsForInformation).toEqual(['ENTITY3']);
        });
        it('Should remove from recipientsForInformation selected by user, recipients selected by user ', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2']);
            cardBuilder.setFieldVisible(InputFieldName.RecipientsForInformation, true);
            cardBuilder.setRecipientsForInformationSelectedByUser(['ENTITY2', 'ENTITY3']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipientsForInformation).toEqual(['ENTITY3']);
        });
    });
    describe('Recipients & recipientsForInformation', () => {
        it('Complex use case', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {entityRecipients: ['ENTITY1', 'ENTITY2'], entityRecipientsForInformation: ['ENTITY3']}
            });
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setFieldVisible(InputFieldName.RecipientsForInformation, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2', 'ENTITY3']);
            cardBuilder.setRecipientsForInformationSelectedByUser(['ENTITY3', 'ENTITY4']);
            const card = await cardBuilder.getCard();
            expect(card.entityRecipients).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3', 'ENTITY4']);
            expect(card.entityRecipientsForInformation).toEqual(['ENTITY4']);
        });
    });
    describe('EntitiesAllowedToRespond', () => {
        beforeEach(() => {
            cardBuilder.setProcessId('process1');
            cardBuilder.setStateId('state1_1');
            cardBuilder.setProcessVersion('v1');
        });
        it('Should set entitiesAllowedToRespond to empty array if state has no response configured ', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.entitiesAllowedToRespond).toEqual([]);
        });
        it('Should set entitiesAllowedToRespond from specific card information if state has response configured', async () => {
            await setProcessConfiguration([
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([['state1_1', {name: 'State 1_1', response: {}}]])
                }
            ]);
            setSpecificCardInformation({valid: true, card: {entitiesAllowedToRespond: ['ENTITY1', 'ENTITY2']}});
            const card = await cardBuilder.getCard();
            expect(card.entitiesAllowedToRespond).toEqual(['ENTITY1', 'ENTITY2']);
        });
        it('Should set entitiesAllowedToRespond to recipients selected by user if state has response configured but entitiesAllowedToRespond not provided by template', async () => {
            await setProcessConfiguration([
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([['state1_1', {name: 'State 1_1', response: {}}]])
                }
            ]);
            setSpecificCardInformation({valid: true, card: {}});
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2']);
            const card = await cardBuilder.getCard();
            expect(card.entitiesAllowedToRespond).toEqual(['ENTITY1', 'ENTITY2']);
        });
    });
    describe('Dates', () => {
        beforeEach(() => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(50));
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        describe('StartDate', () => {
            it('Should be provided by user if field visible', async () => {
                setSpecificCardInformation({valid: true, card: {}});
                cardBuilder.setStartDate(100);
                cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
                const card = await cardBuilder.getCard();
                expect(card.startDate).toBe(100);
                expect(cardBuilder.isStartDateCurrentDate()).toBe(false);
            });
            it('Should be provided by template if field not visible', async () => {
                setSpecificCardInformation({valid: true, card: {startDate: 200}});
                cardBuilder.setFieldVisible(InputFieldName.StartDate, false);
                const card = await cardBuilder.getCard();
                expect(card.startDate).toBe(200);
                expect(cardBuilder.isStartDateCurrentDate()).toBe(false);
            });
            it('Should be current date if field not visible and template does not provide it', async () => {
                cardBuilder.setFieldVisible(InputFieldName.StartDate, false);
                setSpecificCardInformation({valid: true, card: {}});
                const card = await cardBuilder.getCard();
                expect(card.startDate).toBe(50);
                expect(cardBuilder.isStartDateCurrentDate()).toBe(true);
            });
        });
        [InputFieldName.EndDate, InputFieldName.Lttd, InputFieldName.ExpirationDate].forEach((field) => {
            describe(`${field}`, () => {
                it('Should be provided by user if visible', async () => {
                    setSpecificCardInformation({valid: true, card: {}});
                    cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
                    cardBuilder.setStartDate(150);
                    cardBuilder.setFieldVisible(field, true);
                    cardBuilder['set' + getStringWithFirstLetterUpperCase(field)](200);
                    const card = await cardBuilder.getCard();
                    expect(card[field]).toBe(200);
                });
                it('Should be provided by template if not visible', async () => {
                    setSpecificCardInformation({valid: true, card: {[field]: 300}});
                    cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
                    cardBuilder.setStartDate(150);
                    cardBuilder.setFieldVisible(field, false);
                    const card = await cardBuilder.getCard();
                    expect(card[field]).toBe(300);
                });
                it('Should be undefined if not visible and template does not provide it', async () => {
                    setSpecificCardInformation({valid: true, card: {}});
                    cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
                    cardBuilder.setFieldVisible(field, false);
                    const card = await cardBuilder.getCard();
                    expect(card[field]).toBe(undefined);
                });
            });
        });
    });
    describe('TimeSpans', () => {
        it('Should be provided from specific card information field timeSpans', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {},
                timeSpans: [{startDate: 10, endDate: 20, recurrence: new Recurrence(new HourAndMinutes(1, 0))}]
            });
            const card = await cardBuilder.getCard();
            expect(card.timeSpans).toEqual([new TimeSpan(10, 20, new Recurrence(new HourAndMinutes(1, 0)))]);
        });
        it('Should be set with startDate and endDate if viewCardInCalendar is true  ', async () => {
            setSpecificCardInformation({valid: true, card: {}, viewCardInCalendar: true});
            cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
            cardBuilder.setStartDate(50);
            cardBuilder.setFieldVisible(InputFieldName.EndDate, true);
            cardBuilder.setEndDate(100);
            const card = await cardBuilder.getCard();
            expect(card.timeSpans).toEqual([new TimeSpan(50, 100, undefined)]);
        });
        it('Should be set with recurrence if viewCardInCalendar is true and recurrence deprecated field is set ', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {},
                viewCardInCalendar: true,
                recurrence: new Recurrence(new HourAndMinutes(1, 0))
            });
            cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
            cardBuilder.setStartDate(50);
            cardBuilder.setFieldVisible(InputFieldName.EndDate, true);
            cardBuilder.setEndDate(100);
            const card = await cardBuilder.getCard();
            expect(card.timeSpans).toEqual([new TimeSpan(50, 100, new Recurrence(new HourAndMinutes(1, 0)))]);
        });
        it('Should be provided from specific card information field timeSpans if exist and ignore viewCardInCalendar', async () => {
            setSpecificCardInformation({
                valid: true,
                card: {},
                viewCardInCalendar: true,
                timeSpans: [{startDate: 10, endDate: 20, recurrence: new Recurrence(new HourAndMinutes(1, 0))}]
            });
            const card = await cardBuilder.getCard();
            expect(card.timeSpans).toEqual([new TimeSpan(10, 20, new Recurrence(new HourAndMinutes(1, 0)))]);
        });
        it('Should be empty if not provided by template', async () => {
            setSpecificCardInformation({valid: true, card: {}});
            const card = await cardBuilder.getCard();
            expect(card.timeSpans).toEqual(undefined);
        });
    });

    describe('Child card from current user', () => {
        let childCard;
        beforeEach(async () => {
            await setEntities([
                new Entity('ENTITY1', 'ENTITY1_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], []),
                new Entity('ENTITY2', 'ENTITY2_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], []),
                new Entity('ENTITY3', 'ENTITY3_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], [])
            ]);
            await setProcessConfiguration([
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([
                        [
                            'state1_1',
                            {name: 'State 1_1', response: {emittingEntityAllowedToRespond: true, state: 'state1_2'}}
                        ],

                        ['state1_2', {name: 'State 1_2', response: {emittingEntityAllowedToRespond: true}}]
                    ])
                }
            ]);
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite),
                    new ComputedPerimeter('process1', 'state1_2', RightEnum.ReceiveAndWrite)
                ],
                userData: {
                    login: 'test',
                    firstName: 'test',
                    lastName: 'test',
                    entities: ['ENTITY1', 'ENTITY2']
                }
            });
            cardBuilder.setProcessId('process1');
            cardBuilder.setStateId('state1_1');
            cardBuilder.setRecipientsSelectedByUser(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process1',
                state: 'state1_1',
                data: 'myData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {}, childCard: childCard});
        });
        it('Should not exist if user has not permission to send it', async () => {
            await setUserPerimeter({
                computedPerimeters: [new ComputedPerimeter('process1', 'state1_1', RightEnum.Receive)],
                userData: {
                    login: 'test',
                    firstName: 'test',
                    lastName: 'test',
                    entities: ['ENTITY1', 'ENTITY2']
                }
            });
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard).toEqual(undefined);
        });
        it('Should have title,summary and data from specificCardInformation.childcard', async () => {
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.data).toEqual('myData');
            expect(userChildCard.title).toEqual(new I18n('myTitle'));
            expect(userChildCard.summary).toEqual(new I18n('mySummary'));
        });
        it('Should have fixed values for publisherType , severity , hasBeenAcknowledged and hasBeenRead ', async () => {
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.publisherType).toEqual('ENTITY');
            expect(userChildCard.severity).toEqual(Severity.INFORMATION);
            expect(userChildCard.hasBeenAcknowledged).toEqual(false);
            expect(userChildCard.hasBeenRead).toEqual(false);
        });
        it('Should have publisher, process, processVersion , state , startDate , endDate , expirationDate, entityRecipients from card', async () => {
            cardBuilder.setProcessVersion('v1');
            cardBuilder.setFieldVisible(InputFieldName.StartDate, true);
            cardBuilder.setStartDate(200);
            cardBuilder.setFieldVisible(InputFieldName.EndDate, true);
            cardBuilder.setEndDate(300);
            cardBuilder.setFieldVisible(InputFieldName.ExpirationDate, true);
            cardBuilder.setExpirationDate(400);
            cardBuilder.setFieldVisible(InputFieldName.Recipients, true);
            cardBuilder.setRecipientsSelectedByUser(['ENTITY2', 'ENTITY3']);
            cardBuilder.setPublisher('ENTITY1');
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.publisher).toEqual('ENTITY1');
            expect(userChildCard.process).toEqual('process1');
            expect(userChildCard.state).toEqual('state1_1');
            expect(userChildCard.processVersion).toEqual('v1');
            expect(userChildCard.startDate).toEqual(200);
            expect(userChildCard.endDate).toEqual(300);
            expect(userChildCard.expirationDate).toEqual(400);
            expect(userChildCard.entityRecipients).toEqual(['ENTITY2', 'ENTITY3']);
        });
        it('Should have state from state response config if state not defined by template', async () => {
            childCard = getOneCard({
                process: 'process1',
                data: 'myData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            childCard.state = undefined;
            setSpecificCardInformation({valid: true, card: {}, childCard: childCard});
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.state).toEqual('state1_2');
        });
        it('should have publisher from template if set in field specificCardInformation.childCard.publisher', async () => {
            setSpecificCardInformation({valid: true, card: {}, childCard: {publisher: 'ENTITY3'}});
            cardBuilder.setPublisher('ENTITY1');
            await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.publisher).toEqual('ENTITY3');
        });
        it('Should have processInstanceId  = processInstanceId of card + _ + publisher entity ', async () => {
            cardBuilder.setPublisher('ENTITY1');
            const card = await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.processInstanceId).toEqual(card.processInstanceId + '_ENTITY1');
        });
        it('Should have processInstanceId  = processInstanceId of card + _ + publisher entity when publisher set by template', async () => {
            setSpecificCardInformation({valid: true, card: {}, childCard: {publisher: 'ENTITY3'}});
            cardBuilder.setPublisher('ENTITY1');
            const card = await cardBuilder.getCard();
            const userChildCard = cardBuilder.getCurrentUserChildCard();
            expect(userChildCard.processInstanceId).toEqual(card.processInstanceId + '_ENTITY3');
        });
    });
});
