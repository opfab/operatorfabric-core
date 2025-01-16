/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from 'app/services/config/ConfigService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {UserActionLogsView} from './userActionLogs.view';
import {UsersService} from '@ofServices/users/UsersService';
import {UsersServerMock} from '@tests/mocks/UsersServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {User} from '@ofServices/users/model/User';
import {firstValueFrom, ReplaySubject} from 'rxjs';
import {UserActionLogsServerMock} from '@tests/mocks/userActionLogsServer.mock';
import {Page} from '@ofModel/page.model';
import {ActionTypeEnum, UserActionLog} from '@ofServices/userActionLogs/model/UserActionLog';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from '@ofServices/entities/model/Entity';
import {CardsService} from '@ofServices/cards/CardsService';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {UserActionLogsService} from '@ofServices/userActionLogs/UserActionLogsService';

describe('User action logs view ', () => {
    let userActionLogsView: UserActionLogsView;
    let usersServerMock: UsersServerMock;
    let userActionLogsServerMock: UserActionLogsServerMock;
    let entityServerMock: EntitiesServerMock;
    let cardsServerMock: CardsServerMock;

    const user = new User('login', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);

    beforeEach(async () => {
        ConfigService.setConfigServer(new ConfigServerMock());
        TranslationService.setTranslationLib(new TranslationLibMock());
        cardsServerMock = new CardsServerMock();
        CardsService.setCardsServer(cardsServerMock);
        await initEntityService();
        await initCurrentUserPerimeter();
        await mockUserActionLogsService();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    async function initEntityService() {
        entityServerMock = new EntitiesServerMock();
        entityServerMock.setEntities([
            new Entity('entity1', 'ENTITY1 NAME', null, [RoleEnum.CARD_SENDER], null, null),
            new Entity('entity2', 'ENTITY2 NAME', null, [RoleEnum.CARD_SENDER], null, null),
            new Entity('entity3', 'ENTITY3 NAME', null, [RoleEnum.CARD_SENDER], null, null)
        ]);
        EntitiesService.setEntitiesServer(entityServerMock);
        await firstValueFrom(EntitiesService.loadAllEntitiesData());
    }

    async function initCurrentUserPerimeter() {
        await setUserWithPermissions([PermissionEnum.VIEW_USER_ACTION_LOGS]);
    }

    async function setUserWithPermissions(permissions: PermissionEnum[]) {
        const userWithPerimeters = new UserWithPerimeters(user, [], permissions);
        usersServerMock = new UsersServerMock();
        usersServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, '')
        );
        UsersService.setUsersServer(usersServerMock);
        await firstValueFrom(UsersService.loadUserWithPerimetersData());
    }

    async function mockUserActionLogsService() {
        userActionLogsServerMock = new UserActionLogsServerMock();
        const page = new Page(1, 2, [
            new UserActionLog(0, ActionTypeEnum.ACK_CARD, 'login1', ['entity1', 'entity3'], 'uid1', 'comment1'),
            new UserActionLog(0, ActionTypeEnum.CLOSE_SUBSCRIPTION, 'login2', ['entity2'], 'uid2', 'comment2')
        ]);
        userActionLogsServerMock.setResponse(new ServerResponse(page, ServerResponseStatus.OK, ''));
    }

    it('GIVEN user is not admin  WHEN get view THEN user is not authorized to access the view ', async () => {
        setUserWithPermissions([]);
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        expect(userActionLogsView.getUserActionLogPage().isUserAuthorized).toBeFalsy();
    });

    it('GIVEN user is  admin  WHEN get view THEN user is authorized to access the view ', async () => {
        setUserWithPermissions([PermissionEnum.ADMIN]);
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        expect(userActionLogsView.getUserActionLogPage().isUserAuthorized).toBeTrue();
    });

    it('GIVEN user has permission VIEW_USER_ACTION_LOGS  WHEN get view THEN user is authorized to access the view ', async () => {
        setUserWithPermissions([PermissionEnum.VIEW_USER_ACTION_LOGS]);
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        expect(userActionLogsView.getUserActionLogPage().isUserAuthorized).toBeTrue();
    });

    it('GIVEN a list of user WHEN get all user login THEN user login list is provided ', async () => {
        const user2 = new User('login2', 'firstName2', 'lastName2', null, ['group1'], ['ENTITY1']);
        usersServerMock.setResponseForQueryAllUsers(new ServerResponse([user, user2], ServerResponseStatus.OK, ''));
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        const users = await firstValueFrom(userActionLogsView.getAllUserLogins());
        expect(users).toContain('login');
        expect(users).toContain('login2');
    });

    it('GIVEN date is 20/11/2022 WHEN get initial from date THEN initial day is 10 days before 10/11/2022', async () => {
        jasmine.clock().mockDate(new Date(2022, 11, 20));
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        const pubDate = userActionLogsView.getUserActionLogPage().initialFromDate;
        expect(pubDate).toEqual(new Date(2022, 11, 10));
    });

    it('GIVEN a search is performed THEN data is obtain', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeFalse();
        expect(result.data.totalElements).toEqual(2);
        expect(result.data.totalPages).toEqual(1);
        expect(result.data.content[0].action).toEqual('ACK_CARD');
        expect(result.data.content[0].login).toEqual('login1');
        expect(result.data.content[0].cardUid).toEqual('uid1');
        expect(result.data.content[0].comment).toEqual('comment1');
    });

    it('GIVEN a search is performed WHEN technical error  THEN error message is provide ', async () => {
        userActionLogsServerMock = new UserActionLogsServerMock();
        userActionLogsServerMock.setResponse(new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, ''));
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeTrue();
        expect(result.errorMessage).toEqual('Translation (en) of shared.error.technicalError');
    });

    it('GIVEN a search is performed WHEN no data THEN no result message is provide ', async () => {
        userActionLogsServerMock = new UserActionLogsServerMock();
        const page = new Page(1, 0, []);
        userActionLogsServerMock.setResponse(new ServerResponse(page, ServerResponseStatus.OK, ''));

        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeTrue();
        expect(result.errorMessage).toEqual('Translation (en) of shared.noResult');
    });

    it('GIVEN a search is performed WHEN end date before start date THEN error message is provide ', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        userActionLogsView.setDateFrom(2);
        userActionLogsView.setDateTo(1);

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeTrue();
        expect(result.errorMessage).toEqual('Translation (en) of shared.filters.toDateBeforeFromDate');
    });

    it('GIVEN a search is performed WHEN data is obtained THEN data contains entity names', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeFalse();
        expect(result.data.totalElements).toEqual(2);
        expect(result.data.totalPages).toEqual(1);
        expect(result.data.content[0].entities).toEqual('ENTITY1 NAME,ENTITY3 NAME');
    });

    it('GIVEN a search is performed WHEN data is obtained THEN data contains formatted dates', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        const result = await firstValueFrom(userActionLogsView.search());
        expect(result.hasError).toBeFalse();
        expect(result.data.totalElements).toEqual(2);
        expect(result.data.totalPages).toEqual(1);
        expect(result.data.content[0].date).toEqual('01:00:00 01/01/1970'); // Time-zone paris
    });

    it('GIVEN a search is performed WHEN filter by login THEN request is send with login list', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        userActionLogsView.setSelectedLogins(['login1', 'login2']);
        await firstValueFrom(userActionLogsView.search());

        const filterSent = userActionLogsServerMock.getFilters();
        expect(filterSent.get('size')).toEqual(['10']);
        expect(filterSent.get('page')).toEqual(['0']);
        expect(filterSent.get('login')).toEqual(['login1', 'login2']);
        expect(filterSent.get('action')).toEqual([]);
    });

    it('GIVEN a search is performed WHEN filter by action THEN request is send with action list', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        userActionLogsView.setSelectedActions(['ACK_CARD', 'SEND_CARD']);
        await firstValueFrom(userActionLogsView.search());

        const filterSent = userActionLogsServerMock.getFilters();
        expect(filterSent.get('size')).toEqual(['10']);
        expect(filterSent.get('action')).toEqual(['ACK_CARD', 'SEND_CARD']);
        expect(filterSent.get('login')).toEqual([]);
    });

    it('GIVEN a search is performed WHEN setting page number 2 THEN request is send with page 2', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        userActionLogsView.setPageNumber(2);
        await firstValueFrom(userActionLogsView.search());

        const filterSent = userActionLogsServerMock.getFilters();
        expect(filterSent.get('size')).toEqual(['10']);
        expect(filterSent.get('page')).toEqual(['2']);
    });

    it('GIVEN a search is performed WHEN filtering by date THEN request is send with date filtering', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        userActionLogsView.setDateTo(2);
        userActionLogsView.setDateFrom(1);
        await firstValueFrom(userActionLogsView.search());

        const filterSent = userActionLogsServerMock.getFilters();
        expect(filterSent.get('dateTo')).toEqual(['2']);
        expect(filterSent.get('dateFrom')).toEqual(['1']);
    });

    it('GIVEN an uid WHEN getCard THEN card is obtain from archives', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        cardsServerMock.setResponseFunctionForLoadArchivedCard(() => {
            return new ServerResponse({card: {uid: 'uidtest'}}, ServerResponseStatus.OK, '');
        });

        const card = await firstValueFrom(userActionLogsView.getCard('uidtest'));
        expect(card.card.uid).toEqual('uidtest');
    });

    it('GIVEN a child card uid WHEN getCard THEN initial parent card is obtain from archives', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();
        cardsServerMock.setResponseFunctionForLoadArchivedCard((cardUid) => {
            if (cardUid === 'childUid')
                return new ServerResponse(
                    {card: {uid: 'childUid', initialParentCardUid: 'parentUid'}},
                    ServerResponseStatus.OK,
                    ''
                );
            return new ServerResponse({card: {uid: 'parentUid'}}, ServerResponseStatus.OK, '');
        });

        const card = await firstValueFrom(userActionLogsView.getCard('childUid'));
        expect(card.card.uid).toEqual('parentUid');
    });

    it('GIVEN an unexisting uid WHEN getCard THEN alert message is send and no card is return ', async () => {
        UserActionLogsService.setUserActionLogsServer(userActionLogsServerMock);
        userActionLogsView = new UserActionLogsView();

        cardsServerMock.setResponseFunctionForLoadArchivedCard(() => {
            return new ServerResponse(null, ServerResponseStatus.NOT_FOUND, '');
        });
        const alertSubject = new ReplaySubject<Message>();
        AlertMessageService.getAlertMessage().subscribe((Message) => {
            alertSubject.next(Message);
        });
        const card = await firstValueFrom(userActionLogsView.getCard('uidtest'));
        const message = await firstValueFrom(alertSubject.asObservable());

        expect(card).toEqual(null);
        expect(message.message).toEqual('Translation (en) of feed.selectedCardDeleted');
        expect(message.level).toEqual(MessageLevel.ERROR);
    });
});
