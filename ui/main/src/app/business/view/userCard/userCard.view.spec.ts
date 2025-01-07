/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    getOneCard,
    initOpfabAPI,
    loadWebUIConf,
    setEntities,
    setProcessConfiguration,
    setUserPerimeter
} from '@tests/helpers';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UserCardView} from './userCard.view';
import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {State} from '@ofServices/processes/model/Processes';
import {EditionMode, InputFieldName} from './userCard.model';
import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {HandlebarsService} from '@ofServices/handlebars/HandlebarsService';
import {CardAction, Severity} from '@ofModel/light-card.model';
import {setSpecificCardInformation} from '@tests/userCardView/helpers';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {CardsService} from '@ofServices/cards/CardsService';
import {I18n} from '@ofModel/i18n.model';
import {CardWithChildCards} from '@ofServices/cards/model/Card';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {HandlebarsTemplateServerMock} from '@tests/mocks/HandlebarsTemplateServer.mock';
import {EntitiesTree} from '@ofServices/entities/model/EntitiesTree';

declare const opfab: any;

describe('UserCard view ', () => {
    let userCardView: UserCardView;
    let userCardUIControlMock: UserCardUIControlMock;
    let cardsServerMock: CardsServerMock;

    async function initUserCardView(cardWithChildCards?: CardWithChildCards, editionMode?: EditionMode): Promise<void> {
        userCardUIControlMock = new UserCardUIControlMock();
        userCardView = new UserCardView(userCardUIControlMock);
        setCardDataResponse(cardWithChildCards);
        await userCardView.init(cardWithChildCards?.card?.id, editionMode);
    }

    function setCardDataResponse(cardData: CardWithChildCards) {
        cardsServerMock.setResponseFunctionForLoadCard(() => {
            return new ServerResponse(cardData, ServerResponseStatus.OK, '');
        });
    }

    async function setCurrentUserConfiguration(
        computedPerimeters: ComputedPerimeter[],
        permissions: Array<PermissionEnum> = null
    ): Promise<void> {
        await setUserPerimeter({
            computedPerimeters,
            userData: {
                login: 'test',
                firstName: 'test',
                lastName: 'test',
                entities: ['ENTITY1', 'ENTITY2']
            },
            permissions: permissions
        });
    }

    async function initConfigurationCommonToAllTests(
        setCurrentUserConfiguration: (
            computedPerimeters: ComputedPerimeter[],
            permissions?: Array<PermissionEnum>
        ) => Promise<void>
    ) {
        initOpfabAPI();
        HandlebarsService.setHandlebarsTemplateServer(new HandlebarsTemplateServerMock());
        HandlebarsService.clearCache();
        cardsServerMock = new CardsServerMock();
        CardsService.setCardsServer(cardsServerMock);
        await setEntities([
            new Entity('ENTITY1', 'ENTITY1_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], []),
            new Entity('ENTITY2', 'ENTITY2_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], []),
            new Entity('ENTITY3', 'ENTITY3_NAME', '', [RoleEnum.CARD_SENDER, RoleEnum.CARD_RECEIVER], [], [])
        ]);
        await setProcessConfiguration(
            [
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([
                        [
                            'state1_1',
                            {
                                name: 'State 1_1',
                                userCard: {
                                    template: 'templateFile',
                                    recipientForInformationVisible: true,
                                    lttdVisible: true,
                                    expirationDateVisible: true
                                },
                                response: {emittingEntityAllowedToRespond: true, state: 'state1_1'}
                            }
                        ],
                        [
                            'state1_2',
                            {
                                name: 'State 1_2',
                                userCard: {template: 'templateFile2', recipientForInformationVisible: false}
                            }
                        ]
                    ])
                },
                {
                    id: 'process2',
                    version: 'v1',
                    name: 'process name2',
                    states: new Map<string, State>([
                        [
                            'state2_1',
                            {name: 'State 2_1', userCard: {template: 'templateFile2_1', endDateVisible: false}}
                        ],
                        [
                            'state2_2',
                            {
                                name: 'State 2_2',
                                userCard: {template: 'templateFile2_2'},
                                response: {emittingEntityAllowedToRespond: true, state: 'state1_1'}
                            }
                        ]
                    ])
                },
                {
                    id: 'process3',
                    version: 'v1',
                    name: 'process name3',
                    states: new Map<string, State>([
                        [
                            'state3_1',
                            {
                                name: 'State 3_1',
                                userCard: {
                                    template: 'templateFile3_1',
                                    recipientVisible: false,
                                    startDateVisible: false,
                                    endDateVisible: false,
                                    lttdVisible: false,
                                    expirationDateVisible: false
                                },
                                response: {emittingEntityAllowedToRespond: true, state: 'state3_1'}
                            }
                        ],
                        ['state3_2', {name: 'State 3_2', userCard: {template: 'templateFile3_2'}}]
                    ])
                }
            ],
            undefined,
            {
                groups: [
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1', 'process2']
                    },
                    {
                        id: 'service2',
                        name: 'Service 2',
                        processes: ['process3']
                    }
                ]
            }
        );
        await setCurrentUserConfiguration([
            new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite),
            new ComputedPerimeter('process1', 'state1_2', RightEnum.ReceiveAndWrite),
            new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite),
            new ComputedPerimeter('process2', 'state2_2', RightEnum.ReceiveAndWrite),
            new ComputedPerimeter('process3', 'state3_1', RightEnum.ReceiveAndWrite),
            new ComputedPerimeter('process3', 'state3_2', RightEnum.ReceiveAndWrite)
        ]);
    }
    beforeAll(async () => {
        await loadWebUIConf({}); // Necessary to init to avoid having configuration from a previous test
    });
    beforeEach(async () => {
        await initConfigurationCommonToAllTests(setCurrentUserConfiguration);
    });
    describe('User allowed to send card', () => {
        it('Should set user not allowed to send card is user has no perimeter allowed to send card', async () => {
            await setCurrentUserConfiguration([new ComputedPerimeter('process1', 'state1_1', RightEnum.Receive)]);
            await initUserCardView();
            expect(userCardUIControlMock.userNotAllowedToSendCard).toEqual(true);
        });
        it('Should set user allowed to send card if user has at least one perimeter allowed to send card', async () => {
            await setCurrentUserConfiguration([
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)
            ]);
            initUserCardView();
            expect(userCardUIControlMock.userNotAllowedToSendCard).toEqual(false);
        });
        it('Should set user not allowed to send card is user has permission readonly', async () => {
            await setCurrentUserConfiguration(
                [new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite, true)],
                [PermissionEnum.READONLY]
            );
            await initUserCardView();
            expect(userCardUIControlMock.userNotAllowedToSendCard).toEqual(true);
        });
        it('Should set user not allowed to send card if user is not connected to any entity', async () => {
            await setUserPerimeter({
                computedPerimeters: [new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)],
                userData: {
                    login: 'test',
                    firstName: 'test',
                    lastName: 'test',
                    entities: []
                }
            });
            await initUserCardView();
            expect(userCardUIControlMock.userNotAllowedToSendCard).toEqual(true);
        });
    });
    describe('Init view in create mode', () => {
        it('Should get edition mode CREATE from opfab API in template', async () => {
            await initUserCardView();
            expect(opfab.currentUserCard.getEditionMode()).toBe('CREATE');
        });
        it('Should render template', async () => {
            await initUserCardView();
            expect(userCardUIControlMock.template).toEqual('process:process1,version:v1,template:templateFile,Data:');
        });
        it('Should set startDate and endDate on UI after template rendering', async () => {
            let renderTemplatedCalled = false;
            userCardUIControlMock = new UserCardUIControlMock();
            userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                expect(opfab.currentUserCard.getStartDate()).toBeDefined();
                expect(opfab.currentUserCard.getEndDate()).toBeDefined();
                renderTemplatedCalled = true;
                opfab.currentUserCard.setInitialStartDate(1000);
                opfab.currentUserCard.setInitialEndDate(2000);
            });

            userCardView = new UserCardView(userCardUIControlMock);
            await userCardView.init();
            expect(renderTemplatedCalled).toEqual(true);
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toBe(1000);
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toBe(2000);
        });
        it('Should set severity on UI', async () => {
            userCardUIControlMock = new UserCardUIControlMock();
            userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                opfab.currentUserCard.setInitialSeverity('COMPLIANT');
            });

            userCardView = new UserCardView(userCardUIControlMock);
            await userCardView.init();
            expect(userCardUIControlMock.severity).toBe('COMPLIANT');
        });
        it('Should set publisher on UI', async () => {
            await initUserCardView();
            expect(userCardUIControlMock.selectedPublisher).toBe('ENTITY1');
        });
        it('Should set recipients list on UI', async () => {
            userCardUIControlMock = new UserCardUIControlMock();
            userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                opfab.currentUserCard.setDropdownEntityRecipientList([
                    new EntitiesTree('ENTITY1'),
                    new EntitiesTree('ENTITY2')
                ]);
            });

            userCardView = new UserCardView(userCardUIControlMock);
            await userCardView.init();

            expect(userCardUIControlMock.recipients).toEqual([
                {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                {id: 'ENTITY2', label: 'ENTITY2_NAME'}
            ]);
        });
    });
    describe('Init view in edit or copy mode', () => {
        it('Should get edition mode EDITION from opfab API in template', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process1', state: 'state1_1', data: 'mydata'}),
                    childCards: []
                },
                EditionMode.EDITION
            );
            expect(opfab.currentUserCard.getEditionMode()).toBe('EDITION');
        });
        it('Should get edition mode COPY from opfab API in template when card is for copy', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process1', state: 'state1_1', data: 'mydata'}),
                    childCards: []
                },
                EditionMode.COPY
            );
            expect(opfab.currentUserCard.getEditionMode()).toBe('COPY');
        });
        it('Should render template showing card data in card edition mode', async () => {
            await initUserCardView({
                card: getOneCard({process: 'process1', state: 'state1_1', data: 'mydata'}),
                childCards: []
            });
            expect(userCardUIControlMock.template).toEqual(
                'process:process1,version:v1,template:templateFile,Data:mydata'
            );
        });
        it('Should set severity to card severity in UI', async () => {
            await initUserCardView({
                card: getOneCard({
                    process: 'process1',
                    state: 'state1_1',
                    severity: 'COMPLIANT',
                    entityRecipients: ['ENTITY1', 'ENTITY2']
                }),
                childCards: []
            });
            expect(userCardUIControlMock.severity).toBe('COMPLIANT');
        });
        it('Should set selected recipients to card recipients in UI', async () => {
            await initUserCardView({
                card: getOneCard({
                    process: 'process1',
                    state: 'state1_1',
                    entityRecipients: ['ENTITY1', 'ENTITY2']
                }),
                childCards: []
            });
            expect(userCardUIControlMock.selectedRecipients).toEqual(['ENTITY1', 'ENTITY2']);
        });
        it('Should set card dates to user card dates in UI', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process1', state: 'state1_1', startDate: 1000, endDate: 2000}),
                    childCards: []
                },
                EditionMode.EDITION
            );
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toBe(1000);
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toBe(2000);
        });
        it('Should select the right process and state', async () => {
            await initUserCardView({
                card: getOneCard({process: 'process2', state: 'state2_2'}),
                childCards: []
            });
            expect(userCardUIControlMock.selectedProcess).toBe('process2');
            expect(userCardUIControlMock.selectedState).toBe('state2_2');
        });
        it('Should set publisher to card publisher in UI', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process1', state: 'state1_1', publisher: 'ENTITY2'}),
                    childCards: []
                },
                EditionMode.EDITION
            );
            expect(userCardUIControlMock.selectedPublisher).toBe('ENTITY2');
        });
        it('childCard with card publisher = card  publisher should be available via opfab.currentUserCard.getUserEntityChildCard', async () => {
            const userChildCard = getOneCard({process: 'process1', state: 'state1_1', publisher: 'ENTITY2'});
            const otherChildCard = getOneCard({process: 'process1', state: 'state1_1', publisher: 'ENTITY1'});
            await initUserCardView({
                card: getOneCard({process: 'process1', state: 'state1_1', publisher: 'ENTITY2'}),
                childCards: [userChildCard, otherChildCard]
            });
            expect(opfab.currentUserCard.getUserEntityChildCard()).toEqual(userChildCard);
        });
    });
    describe('User select', () => {
        describe('A new state', () => {
            it('Should render again template with new state', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile2,Data:'
                );
            });
            it('Should set selected state available for template via opfab.currentUserCard.getState()', async () => {
                await initUserCardView();
                expect(opfab.currentUserCard.getState()).toEqual('state1_1');
                await userCardView.userClicksOnState('state1_2');
                expect(opfab.currentUserCard.getState()).toEqual('state1_2');
            });
            it('Should render again template with new state showing card data in card edition mode ', async () => {
                await initUserCardView({
                    card: getOneCard({process: 'process1', state: 'state1_1', data: 'mydata'}),
                    childCards: []
                });
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:mydata'
                );
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile2,Data:mydata'
                );
            });
            it('should change severity in UI if severity change with new state', async () => {
                userCardUIControlMock = new UserCardUIControlMock();
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialSeverity('COMPLIANT');
                });
                userCardView = new UserCardView(userCardUIControlMock);
                await userCardView.init();
                expect(userCardUIControlMock.severity).toBe('COMPLIANT');
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialSeverity('ACTION');
                });
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.severity).toBe('ACTION');
            });
            it('Should hide recipient for information in UI if recipient for information are hidden in new state', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.RecipientsForInformation]).toBe(
                    true
                );
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.RecipientsForInformation]).toBe(
                    false
                );
            });
            it('Should set new recipient list in UI corresponding to new state', async () => {
                userCardUIControlMock = new UserCardUIControlMock();
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setDropdownEntityRecipientList([
                        new EntitiesTree('ENTITY1'),
                        new EntitiesTree('ENTITY3')
                    ]);
                });
                userCardView = new UserCardView(userCardUIControlMock);
                await userCardView.init();
                expect(userCardUIControlMock.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY3', label: 'ENTITY3_NAME'}
                ]);
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {});

                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'},
                    {id: 'ENTITY3', label: 'ENTITY3_NAME'}
                ]);
            });
            it('should reset initially selected recipients in UI if a new state is selected', async () => {
                userCardUIControlMock = new UserCardUIControlMock();
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialSelectedRecipients(['ENTITY1', 'ENTITY2']);
                });
                userCardView = new UserCardView(userCardUIControlMock);
                await userCardView.init();
                expect(userCardUIControlMock.selectedRecipients).toEqual(['ENTITY1', 'ENTITY2']);
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {});
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.selectedRecipients).toEqual([]);
            });
            it('should reset initially selected recipients for information in UI if a new state is selected', async () => {
                userCardUIControlMock = new UserCardUIControlMock();
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialSelectedRecipientsForInformation(['ENTITY1', 'ENTITY2']);
                });
                userCardView = new UserCardView(userCardUIControlMock);
                await userCardView.init();
                expect(userCardUIControlMock.selectedRecipientsForInformation).toEqual(['ENTITY1', 'ENTITY2']);
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {});
                await userCardView.userClicksOnState('state1_2');
                expect(userCardUIControlMock.selectedRecipientsForInformation).toEqual([]);
            });
        });
        describe('The current state', () => {
            it('Should not render again template', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                userCardUIControlMock.initMock();
                await userCardView.userClicksOnState('state1_1');
                expect(userCardUIControlMock.template).toBeUndefined();
            });
        });
        describe('A new process', () => {
            it('Should render again template with new process/state', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                await userCardView.userClicksOnProcess('process2');
                expect(userCardUIControlMock.template).toEqual(
                    'process:process2,version:v1,template:templateFile2_1,Data:'
                );
            });
            it('Should set selected process available for template via opfab.currentUserCard.getProcessId()', async () => {
                await initUserCardView();
                expect(opfab.currentUserCard.getProcessId()).toEqual('process1');
                await userCardView.userClicksOnProcess('process2');
                expect(opfab.currentUserCard.getProcessId()).toEqual('process2');
            });
            it('Should hide in UI endDate if endDate hidden in new state configuration', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.EndDate]).toBe(true);
                await userCardView.userClicksOnProcess('process2');
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.EndDate]).toBe(false);
            });
        });
        describe('The current process', () => {
            it('Should not render again template', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                userCardUIControlMock.initMock();
                await userCardView.userClicksOnProcess('process1');
                expect(userCardUIControlMock.template).toBeUndefined();
            });
        });
        describe('A new process group', () => {
            it('Should render again template with new process/state', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                await userCardView.userClicksOnProcess('process2');
                expect(userCardUIControlMock.template).toEqual(
                    'process:process2,version:v1,template:templateFile2_1,Data:'
                );
            });
            it('Should hide recipient in UI if recipient hidden in new state configuration', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Recipients]).toBe(true);
                await userCardView.userClicksOnProcessGroup('service2');
                expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Recipients]).toBe(false);
            });
            it('Should set new startDate and endDate in UI from template', async () => {
                userCardUIControlMock = new UserCardUIControlMock();
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialStartDate(1000);
                    opfab.currentUserCard.setInitialEndDate(2000);
                });
                userCardView = new UserCardView(userCardUIControlMock);
                await userCardView.init();
                expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toBe(1000);
                expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toBe(2000);
                userCardUIControlMock.setFunctionToRenderTemplate(async () => {
                    opfab.currentUserCard.setInitialStartDate(8000);
                    opfab.currentUserCard.setInitialEndDate(11000);
                });
                await userCardView.userClicksOnProcessGroup('service2');
                expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toBe(8000);
                expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toBe(11000);
            });
        });
        describe('The current process group', () => {
            it('Should not render again template', async () => {
                await initUserCardView();
                expect(userCardUIControlMock.template).toEqual(
                    'process:process1,version:v1,template:templateFile,Data:'
                );
                userCardUIControlMock.initMock();
                await userCardView.userClicksOnProcessGroup('service1');
                expect(userCardUIControlMock.template).toBeUndefined();
            });
        });
    });
    describe('Get card for preview', () => {
        beforeEach(async () => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(100));
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('Should return card containing current process, process version and state', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;

            expect(cardForPreview.process).toEqual('process1');
            expect(cardForPreview.processVersion).toEqual('v1');
            expect(cardForPreview.state).toEqual('state1_1');
        });
        it('Should return card containing severity selected by user', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            userCardView.userSelectsSeverity(Severity.ACTION);
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.severity).toEqual('ACTION');
        });
        it('Should return card containing dates set by user', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            userCardView.userSetStartDate(1000);
            userCardView.userSetEndDate(2000);
            userCardView.userSetLttd(1500);
            userCardView.userSetExpirationDate(1900);
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.startDate).toEqual(1000);
            expect(cardForPreview.endDate).toEqual(2000);
            expect(cardForPreview.lttd).toEqual(1500);
            expect(cardForPreview.expirationDate).toEqual(1900);
        });
        it('Should return card containing publisher set by user', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            userCardView.userSetPublisher('ENTITY2');
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.publisher).toEqual('ENTITY2');
        });
        it('Should return card containing recipients and recipients for information selected by user', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2', 'ENTITY3']);
            userCardView.userSetRecipientsForInformation(['ENTITY4']);
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.entityRecipients).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3', 'ENTITY4']);
            expect(cardForPreview.entityRecipientsForInformation).toEqual(['ENTITY4']);
        });
        it('Should return cards with tags form card to copy', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process2', state: 'state2_2', tags: ['tag1', 'tag2']}),
                    childCards: []
                },
                EditionMode.COPY
            );
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.tags).toEqual(['tag1', 'tag2']);
        });
        it('Should return card with tags form card to edit', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process2', state: 'state2_2', tags: ['tag1', 'tag2']}),
                    childCards: []
                },
                EditionMode.EDITION
            );
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const cardForPreview = userCardView.getCardWithChildCardsForPreview().card;
            expect(cardForPreview.tags).toEqual(['tag1', 'tag2']);
        });
        it('Should return undefined if card is not valid', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: false, card: {data: 'test'}});
            const cardForPreview = await userCardView.prepareCardToSend();
            expect(cardForPreview).toBeUndefined();
        });
    });
    describe('Get ChildCard for preview ', async () => {
        let childCard;
        it('Should be empty if no child cards in existing card to edit', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process2', state: 'state2_2'}),
                    childCards: []
                },
                EditionMode.EDITION
            );
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(0);
        });

        it('Should contain child cards of existing card to edit if card action contains KEEP_CHILD_CARD', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process2', state: 'state2_2', actions: [CardAction.KEEP_CHILD_CARDS]}),
                    childCards: [getOneCard({process: 'process1', state: 'state1_1'})]
                },
                EditionMode.EDITION
            );
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(1);
            expect(childCards[0].process).toEqual('process1');
            expect(childCards[0].state).toEqual('state1_1');
        });
        it('Should be empty if edition mode is COPY and existing card has child cards', async () => {
            await initUserCardView(
                {
                    card: getOneCard({process: 'process2', state: 'state2_2', actions: [CardAction.KEEP_CHILD_CARDS]}),
                    childCards: [getOneCard({process: 'process1', state: 'state1_1'})]
                },
                EditionMode.COPY
            );
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(0);
        });
        it('Should contain child card from specific card information', async () => {
            await initUserCardView();
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process1',
                state: 'state1_1',
                data: 'childData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {data: 'test'}, childCard: childCard});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(1);
            expect(childCards[0].data).toEqual('childData');
        });
        it('Should contain child card from specific card information + child card from existing card if card action contains KEEP_CHILD_CARDS', async () => {
            await initUserCardView(
                {
                    card: getOneCard({
                        process: 'process1',
                        state: 'state1_1',
                        startDate: 0,
                        endDate: new Date().valueOf() + 10000,
                        lttd: new Date().valueOf() + 5000,
                        expirationDate: new Date().valueOf() + 8000,
                        actions: [CardAction.KEEP_CHILD_CARDS]
                    }),
                    childCards: [
                        getOneCard({
                            process: 'process1',
                            state: 'state1_1',
                            publisher: 'ENTITY3',
                            data: 'existingChildData'
                        })
                    ]
                },
                EditionMode.EDITION
            );
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process1',
                state: 'state1_1',
                data: 'childData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {data: 'test'}, childCard: childCard});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(2);
            expect(childCards[0].data).toEqual('existingChildData');
            expect(childCards[1].data).toEqual('childData');
        });
        it('Should replace current user childcard by the one in specific card information', async () => {
            await initUserCardView(
                {
                    card: getOneCard({
                        process: 'process1',
                        state: 'state1_1',
                        startDate: 0,
                        endDate: new Date().valueOf() + 10000,
                        lttd: new Date().valueOf() + 5000,
                        expirationDate: new Date().valueOf() + 8000,
                        actions: [CardAction.KEEP_CHILD_CARDS]
                    }),
                    childCards: [
                        getOneCard({
                            process: 'process1',
                            state: 'state1_1',
                            publisher: 'ENTITY3',
                            data: 'existingChildData'
                        }),
                        getOneCard({
                            process: 'process1',
                            state: 'state1_1',
                            publisher: 'ENTITY1',
                            data: 'existingChildData2'
                        })
                    ]
                },
                EditionMode.EDITION
            );
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process1',
                state: 'state1_1',
                data: 'childData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {data: 'test'}, childCard: childCard});
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(2);
            expect(childCards[0].data).toEqual('existingChildData');
            expect(childCards[1].data).toEqual('childData');
        });
        it('should update keepChildCards with user selection of checkbox', async () => {
            await initUserCardView(
                {
                    card: getOneCard({
                        process: 'process1',
                        state: 'state1_1',
                        startDate: 0,
                        endDate: new Date().valueOf() + 10000,
                        lttd: new Date().valueOf() + 5000,
                        expirationDate: new Date().valueOf() + 8000,
                        actions: [CardAction.KEEP_CHILD_CARDS]
                    }),
                    childCards: [
                        getOneCard({
                            process: 'process1',
                            state: 'state1_1',
                            publisher: 'ENTITY3',
                            data: 'childData'
                        })
                    ]
                },
                EditionMode.EDITION
            );
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            userCardView.userSelectsKeepChildCards(false);
            await userCardView.prepareCardToSend();
            const childCards = userCardView.getCardWithChildCardsForPreview().childCards;
            expect(childCards.length).toEqual(0);
        });
    });
    describe('Send card', () => {
        let childCard;
        beforeEach(async () => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(100));
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('Should post card', async () => {
            await initUserCardView();
            setSpecificCardInformation({valid: true, card: {data: 'test'}});
            await userCardView.prepareCardToSend();
            await userCardView.sendCardAncChildCard();
            expect(cardsServerMock.cardsPosted[0].data).toEqual('test');
        });
        it('Should post child card', async () => {
            await initUserCardView();
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process1',
                state: 'state1_1',
                data: 'childData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {data: 'test'}, childCard: childCard});
            await userCardView.prepareCardToSend();
            await userCardView.sendCardAncChildCard();
            expect(cardsServerMock.cardsPosted[0].data).toEqual('test');
            expect(cardsServerMock.cardsPosted[1].data).toEqual('childData');
        });
        it('When startDate is set to currentDate it should send card and childCard with the date when user clicks on send and not when preview has been clicked ', async () => {
            await initUserCardView();
            await userCardView.userClicksOnProcessGroup('service2');
            userCardView.userSetRecipients(['ENTITY1', 'ENTITY2']);
            childCard = getOneCard({
                process: 'process3',
                state: 'state3_1',
                data: 'childData',
                title: new I18n('myTitle'),
                summary: new I18n('mySummary')
            });
            childCard.publisher = undefined;
            setSpecificCardInformation({valid: true, card: {data: 'test'}, childCard: childCard});
            await userCardView.prepareCardToSend();
            jasmine.clock().mockDate(new Date(50000));
            await userCardView.sendCardAncChildCard();
            expect(cardsServerMock.cardsPosted[0].startDate).toEqual(50000);
            expect(cardsServerMock.cardsPosted[1].startDate).toEqual(50000);
        });
    });
});
