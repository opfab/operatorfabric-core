/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofModel/entity.model';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {RemoteLoggerServiceMock} from '@tests/mocks/remote-logger.service.mock';
import {SettingsServerMock} from '@tests/mocks/settingsServer.mock';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';
import {SettingsService} from 'app/business/services/users/settings.service';
import {UserService} from 'app/business/services/users/user.service';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {firstValueFrom} from 'rxjs';
import {ActivityAreaView} from './activityarea.view';

describe('ActivityAreaView', () => {
    let userService: UserService;
    let userServerMock: UserServerMock;
    let entitiesService: EntitiesService;
    let entitiesServerMock: EntitiesServerMock;
    let settingsService: SettingsService;
    let settingsServerMock: SettingsServerMock;
    let user: User;
    let lightCardsStoreService: LightCardsStoreService;
    let activityAreaView: ActivityAreaView;
    let opfabLoggerService: OpfabLoggerService;

    beforeEach(() => {
        jasmine.clock().uninstall();
        mockOpfabLoggerService();
        mockUserService();
        mockEntitiesService();
        mockSettingsService();
        mockLightCardStoreService();
    });

    function mockOpfabLoggerService() {
        opfabLoggerService = new OpfabLoggerService(
            new RemoteLoggerServiceMock(new ConfigService(new ConfigServerMock()), null)
        );
    }

    function mockUserService() {
        userServerMock = new UserServerMock();
        userService = new UserService(userServerMock, opfabLoggerService, null);
    }

    function mockEntitiesService() {
        entitiesServerMock = new EntitiesServerMock();
        entitiesService = new EntitiesService(opfabLoggerService, entitiesServerMock, null);
        const entities: Entity[] = new Array();
        entities.push(new Entity('ENTITY1', 'ENTITY1_NAME', '', true, [], []));
        entities.push(new Entity('ENTITY2', 'ENTITY2_NAME', '', true, [], []));
        entities.push(new Entity('ENTITY_NOT_ALLOWED_TO_SEND_CARD', 'ENTITY3', '', false, [], []));
        entitiesServerMock.setEntities(entities);
        entitiesService.loadAllEntitiesData().subscribe();
        userServerMock.setResponseForConnectedUsers(new ServerResponse([], ServerResponseStatus.OK, null));
    }

    function mockSettingsService() {
        settingsServerMock = new SettingsServerMock();
        const currentUserStore = new CurrentUserStore();
        currentUserStore.setCurrentUserAuthenticationValid('currentUser');
        settingsService = new SettingsService(settingsServerMock, opfabLoggerService, currentUserStore);
    }

    function mockLightCardStoreService() {
        lightCardsStoreService = new LightCardsStoreService(
            userService,
            new OpfabEventStreamService(new OpfabEventStreamServerMock(), null, opfabLoggerService),
            null,
            opfabLoggerService,
            null
        );
    }

    afterEach(() => {
        jasmine.clock().uninstall();
        activityAreaView.stopUpdateRegularyConnectedUser();
    });

    async function mockUserConfig(userEntities: string[], userConnectedEntities: string[]) {
        user = new User('currentUser', 'firstname', 'lastname', [], userEntities);
        userServerMock.setResponseForUser(new ServerResponse(user, ServerResponseStatus.OK, null));
        const userForPerimeter = new User('currentUser', 'firstname', 'lastname', [], userConnectedEntities);
        const userWithPerimeters = new UserWithPerimeters(userForPerimeter, new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(userService.loadUserWithPerimetersData());
    }

    function initActivityAreaView() {
        activityAreaView = new ActivityAreaView(userService, entitiesService, settingsService, lightCardsStoreService);
    }

    it('GIVEN a user  WHEN he is member of entity1 THEN activityArea has one line with entity1 and entity1 name', async () => {
        mockUserConfig(['ENTITY1'], []);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(1);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].entityName).toEqual('ENTITY1_NAME');
    });

    it('GIVEN a user  WHEN he is member of entity1 and entity2 THEN activityArea has 2 lines with entity1 and entity2', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], []);
        initActivityAreaView();

        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user  WHEN he is member of entity2 and entity1 THEN activityArea has lines sorted by entity name ', async () => {
        mockUserConfig(['ENTITY2', 'ENTITY1'], []);
        initActivityAreaView();

        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user  WHEN one entity is not allowed to send card THEN activityAreaView does not contains the entity', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2', 'ENTITY_NOT_ALLOWED_TO_SEND_CARD'], []);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user member of entity1 and entity2 WHEN entity2 is disconnected THEN entity2 is not connected in the activityAreaView', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].isUserConnected).toEqual(true);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].isUserConnected).toEqual(false);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN entity1 has another user currently connected THEN entity1 line contains the other user login in the activityAreaView ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], []);

        const connectedUsers = [{login: 'anotherUser', entitiesConnected: ['ENTITY1']}];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual(['anotherUser']);
        expect(activityAreaPage.lines[0].connectedUsersText).toEqual('anotherUser');
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN user is currently connected to entity1 THEN entity1 line does not contains the current user login ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        const connectedUsers = [
            {login: 'anotherUser', entitiesConnected: ['ENTITY1']},
            {login: 'currentUser', entitiesConnected: ['ENTITY1']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual(['anotherUser']);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN entity1 has 3 users currently connected THEN entity1 line contains the 3 user logins', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        const connectedUsers = [
            {login: 'anotherUser', entitiesConnected: ['ENTITY1']},
            {login: 'anotherUser2', entitiesConnected: ['ENTITY1', 'ENTITY2']},
            {login: 'anotherUser3', entitiesConnected: ['ENTITY1', 'ENTITY4']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual(['anotherUser', 'anotherUser2', 'anotherUser3']);
        expect(activityAreaPage.lines[0].connectedUsersText).toEqual('anotherUser, anotherUser2, anotherUser3');
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual(['anotherUser2']);
    });

    it('GIVEN a user member of entity1 WHEN entity1 has 3 users currently connected THEN connected user text contains the 3 user logins sorted by alphabetical order', async () => {
        mockUserConfig(['ENTITY1'], ['ENTITY1']);

        const connectedUsers = [
            {login: 'aa', entitiesConnected: ['ENTITY1']},
            {login: 'zz', entitiesConnected: ['ENTITY1']},
            {login: 'abc', entitiesConnected: ['ENTITY1']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsersText).toEqual('aa, abc, zz');
    });

    it('GIVEN a user member of entity1 and entity2 WHEN save activity area with entity1 only connected THEN settings are updated with entity2 disconnected ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);

        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeTruthy();
        expect(settingsServerMock.userIdPatch).toEqual('currentUser');
        expect(settingsServerMock.settingsPatch['login']).toEqual('currentUser');
        expect(settingsServerMock.settingsPatch['entitiesDisconnected']).toEqual(['ENTITY2']);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN save activity area with entity1 and entity2 connected THEN settings are updated with no entity disconnected ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        activityAreaView.setEntityConnected('ENTITY1', true);
        activityAreaView.setEntityConnected('ENTITY2', true);
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeTruthy();
        expect(settingsServerMock.userIdPatch).toEqual('currentUser');
        expect(settingsServerMock.settingsPatch['login']).toEqual('currentUser');
        expect(settingsServerMock.settingsPatch['entitiesDisconnected']).toEqual([]);
    });

    it('GIVEN a user WHEN save activity area with error from back THEN return false', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        settingsServerMock.setResponseForPatchUserSettings(
            new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, null)
        );
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeFalsy();
    });

    it('GIVEN a user WHEN save activity area THEN perimeter is reloaded ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        activityAreaView.setEntityConnected('ENTITY1', true);
        activityAreaView.setEntityConnected('ENTITY2', true);
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));

        // set new perimeter after save
        const newUserWithPerimeters = new UserWithPerimeters(user, new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(newUserWithPerimeters, ServerResponseStatus.OK, null)
        );
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeTruthy();
        expect(userService.getCurrentUserWithPerimeters().userData.entities).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('GIVEN a user WHEN save activity area THEN lightcard store is cleared ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeTruthy();
        const lightCards = await firstValueFrom(lightCardsStoreService.getLightCards());
        expect(lightCards).toEqual([]);
    });

    it('GIVEN an activity area view WHEN activity area view is init THEN it is updated after 2 seconds', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        const connectedUsers = [
            {login: 'anotherUser', entitiesConnected: ['ENTITY1']},
            {login: 'currentUser', entitiesConnected: ['ENTITY1']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual(['anotherUser']);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);

        const newConnectedUsers = [{login: 'currentUser', entitiesConnected: ['ENTITY1']}];
        userServerMock.setResponseForConnectedUsers(
            new ServerResponse(newConnectedUsers, ServerResponseStatus.OK, null)
        );
        jasmine.clock().tick(2500);

        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual([]);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);
    });

    it('GIVEN an activity area view initialized WHEN stopping view THEN view is not updated anymore', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        const connectedUsers = [
            {login: 'anotherUser', entitiesConnected: ['ENTITY1']},
            {login: 'currentUser', entitiesConnected: ['ENTITY1']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());

        const newConnectedUsers = [{login: 'currentUser', entitiesConnected: ['ENTITY1']}];
        userServerMock.setResponseForConnectedUsers(
            new ServerResponse(newConnectedUsers, ServerResponseStatus.OK, null)
        );
        jasmine.clock().tick(2500);

        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual([]);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);

        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));
        activityAreaView.stopUpdateRegularyConnectedUser();
        jasmine.clock().tick(2500);
        // should be set again set to new connected users
        expect(activityAreaPage.lines).toHaveSize(2);
        expect(activityAreaPage.lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.lines[0].connectedUsers).toEqual([]);
        expect(activityAreaPage.lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.lines[1].connectedUsers).toEqual([]);
    });
});
