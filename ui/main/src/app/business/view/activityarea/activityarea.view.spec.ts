/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofServices/entities/model/Entity';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {SettingsServerMock} from '@tests/mocks/settingsServer.mock';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {SettingsService} from 'app/business/services/users/settings.service';
import {UserService} from 'app/business/services/users/user.service';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {firstValueFrom} from 'rxjs';
import {ActivityAreaView} from './activityarea.view';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {getOneLightCard} from '@tests/helpers';
import {Severity} from '@ofModel/light-card.model';
import {OpfabStore} from 'app/business/store/opfabStore';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';

describe('ActivityAreaView', () => {
    let userServerMock: UserServerMock;
    let entitiesServerMock: EntitiesServerMock;
    let settingsServerMock: SettingsServerMock;
    let user: User;
    let activityAreaView: ActivityAreaView;

    beforeEach(() => {
        jasmine.clock().uninstall();
        mockUserService();
        mockEntitiesService();
        mockSettingsService();
    });

    function mockUserService() {
        userServerMock = new UserServerMock();
        UserService.setUserServer(userServerMock);
    }

    function mockEntitiesService() {
        entitiesServerMock = new EntitiesServerMock();
        EntitiesService.setEntitiesServer(entitiesServerMock);
        const entities: Entity[] = [
            new Entity(
                'CLUSTERING_ENTITY',
                'CLUSTERING_ENTITY_NAME',
                '',
                [RoleEnum.CARD_SENDER, RoleEnum.ACTIVITY_AREA_GROUP],
                [],
                []
            ),

            new Entity(
                'ENTITY1',
                'ENTITY1_NAME',
                '',
                [RoleEnum.ACTIVITY_AREA, RoleEnum.CARD_SENDER],
                [],
                ['CLUSTERING_ENTITY']
            ),
            new Entity(
                'ENTITY2',
                'ENTITY2_NAME',
                '',
                [RoleEnum.ACTIVITY_AREA, RoleEnum.CARD_SENDER],
                [],
                ['CLUSTERING_ENTITY']
            ),

            new Entity(
                'ENTITY_WITH_NO_ACTIVITY_AREA_ROLE',
                'ENTITY3_NAME',
                '',
                [RoleEnum.CARD_SENDER],
                [],
                ['CLUSTERING_ENTITY']
            ),

            new Entity(
                'ENTITY_WITH_NO_CLUSTERING_PARENT',
                'ENTITY4_NAME',
                '',
                [RoleEnum.ACTIVITY_AREA, RoleEnum.CARD_SENDER],
                [],
                ['ENTITY1']
            ),

            new Entity(
                'ENTITY_WITH_NO_PARENT',
                'ENTITY5_NAME',
                '',
                [RoleEnum.ACTIVITY_AREA, RoleEnum.CARD_SENDER],
                [],
                null
            )
        ];
        entitiesServerMock.setEntities(entities);
        EntitiesService.loadAllEntitiesData().subscribe();
        userServerMock.setResponseForConnectedUsers(new ServerResponse([], ServerResponseStatus.OK, null));
    }

    function mockSettingsService() {
        settingsServerMock = new SettingsServerMock();
        SettingsService.setSettingsServer(settingsServerMock);
        CurrentUserStore.setCurrentUserAuthenticationValid('currentUser');
    }

    afterEach(() => {
        jasmine.clock().uninstall();
        activityAreaView.stopUpdateRegularyConnectedUser();
    });

    async function mockUserConfig(userEntities: string[], userConnectedEntities: string[]) {
        user = new User('currentUser', 'firstname', 'lastname', null, [], userEntities);
        userServerMock.setResponseForUser(new ServerResponse(user, ServerResponseStatus.OK, null));
        const userForPerimeter = new User('currentUser', 'firstname', 'lastname', null, [], userConnectedEntities);
        const userWithPerimeters = new UserWithPerimeters(userForPerimeter, new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());
    }

    function initActivityAreaView() {
        activityAreaView = new ActivityAreaView();
    }

    it('GIVEN a user WHEN he is member of entity1 THEN activityArea has one line with entity1 and entity1 name', async () => {
        mockUserConfig(['ENTITY1'], []);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters).toHaveSize(1);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityName).toEqual('ENTITY1_NAME');
    });

    it('GIVEN a user WHEN he is member of entity1 and entity2 THEN activityArea has 2 lines with entity1 and entity2', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], []);
        initActivityAreaView();

        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user WHEN he is member of entity with no parents or no parents with the correct role THEN activityArea has 2 lines with no title', async () => {
        mockUserConfig(['ENTITY_WITH_NO_CLUSTERING_PARENT', 'ENTITY_WITH_NO_PARENT'], []);
        initActivityAreaView();

        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].name).toEqual(' ');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY_WITH_NO_CLUSTERING_PARENT');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityName).toEqual('ENTITY4_NAME');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY_WITH_NO_PARENT');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityName).toEqual('ENTITY5_NAME');
    });

    it('GIVEN a user WHEN he is member of entity2 and entity1 THEN activityArea has lines sorted by entity name ', async () => {
        mockUserConfig(['ENTITY2', 'ENTITY1'], []);
        initActivityAreaView();

        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user WHEN one entity does not have the ACTIVITY_AREA role THEN activityAreaView does not contains the entity', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2', 'ENTITY_WITH_NO_ACTIVITY_AREA_ROLE'], []);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityName).toEqual('ENTITY1_NAME');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityName).toEqual('ENTITY2_NAME');
    });

    it('GIVEN a user member of entity1 and entity2 WHEN entity2 is disconnected THEN entity2 is not connected in the activityAreaView', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);
        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].isUserConnected).toEqual(true);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].isUserConnected).toEqual(false);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN entity1 has another user currently connected THEN entity1 line contains the other user login in the activityAreaView ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], []);

        const connectedUsers = [{login: 'anotherUser', entitiesConnected: ['ENTITY1']}];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual(['anotherUser']);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsersText).toEqual('anotherUser');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);
    });

    it('GIVEN a user member of entity1 and entity2 WHEN user is currently connected to entity1 THEN entity1 line contains the current user login ', async () => {
        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1', 'ENTITY2']);

        const connectedUsers = [
            {login: 'anotherUser', entitiesConnected: ['ENTITY1']},
            {login: 'currentUser', entitiesConnected: ['ENTITY1']}
        ];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        initActivityAreaView();
        const activityAreaPage = await firstValueFrom(activityAreaView.getActivityAreaPage());
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual([
            'anotherUser',
            'currentUser'
        ]);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);
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
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual([
            'anotherUser',
            'anotherUser2',
            'anotherUser3'
        ]);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsersText).toEqual(
            'anotherUser, anotherUser2, anotherUser3'
        );
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual(['anotherUser2']);
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
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsersText).toEqual('aa, abc, zz');
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
        expect(UserService.getCurrentUserWithPerimeters().userData.entities).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('GIVEN a user WHEN set entity connected THEN Activity Area needs to be saved ', async () => {
        mockUserConfig(['ENTITY1'], []);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        activityAreaView.setEntityConnected('ENTITY1', true);
        expect(activityAreaView.doesActivityAreasNeedToBeSaved()).toBeTruthy;
    });

    it('GIVEN a user WHEN set entity connected an even number of times THEN Activity Area does not need to be saved ', async () => {
        mockUserConfig(['ENTITY1'], []);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        activityAreaView.setEntityConnected('ENTITY1', true);
        activityAreaView.setEntityConnected('ENTITY1', false);
        activityAreaView.setEntityConnected('ENTITY1', true);
        activityAreaView.setEntityConnected('ENTITY1', false);
        expect(activityAreaView.doesActivityAreasNeedToBeSaved()).toBeFalsy;
    });

    it('GIVEN a user WHEN save activity area THEN lightcard store is cleared ', async () => {
        const opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        const card = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ALARM
        });
        opfabEventStreamServerMock.sendLightCard(card);

        mockUserConfig(['ENTITY1', 'ENTITY2'], ['ENTITY1']);
        initActivityAreaView();
        await firstValueFrom(activityAreaView.getActivityAreaPage());
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
        const saved = await firstValueFrom(activityAreaView.saveActivityArea());
        expect(saved).toBeTruthy();
        const lightCards = await firstValueFrom(OpfabStore.getLightCardStore().getLightCards());
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
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual([
            'anotherUser',
            'currentUser'
        ]);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);

        const newConnectedUsers = [{login: 'currentUser', entitiesConnected: ['ENTITY1']}];
        userServerMock.setResponseForConnectedUsers(
            new ServerResponse(newConnectedUsers, ServerResponseStatus.OK, null)
        );
        jasmine.clock().tick(2500);

        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual(['currentUser']);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);
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

        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual(['currentUser']);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);

        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));
        activityAreaView.stopUpdateRegularyConnectedUser();
        jasmine.clock().tick(2500);
        // should be set again set to new connected users
        expect(activityAreaPage.activityAreaClusters[0].lines).toHaveSize(2);
        expect(activityAreaPage.activityAreaClusters[0].lines[0].entityId).toEqual('ENTITY1');
        expect(activityAreaPage.activityAreaClusters[0].lines[0].connectedUsers).toEqual(['currentUser']);
        expect(activityAreaPage.activityAreaClusters[0].lines[1].entityId).toEqual('ENTITY2');
        expect(activityAreaPage.activityAreaClusters[0].lines[1].connectedUsers).toEqual([]);
    });
});
