/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {TestBed} from '@angular/core/testing';
import {AcknowledgmentAllowedEnum, Response, State} from '@ofModel/processes.model';
import {Map as OfMap} from '@ofModel/map';
import {getOneRandomCard, getOneRandomProcess} from '@tests/helpers';
import {Card} from '@ofModel/card.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {User} from '@ofModel/user.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {StoreModule} from '@ngrx/store';
import {appReducer} from '@ofStore/index';
import {ConfigService} from '@ofServices/config.service';
import {EntitiesService} from '@ofServices/entities.service';
import {EntitiesServiceMock} from '@tests/mocks/entities.service.mock';


describe('AcknowledgeService testing ', () => {

    let acknowledgeService: AcknowledgeService;
    let entitiesService: EntitiesService;
    let card: Card, cardForEntityParent: Card;
    let userMemberOfEntity1: User, userMemberOfEntity2: User;
    let statesList;

    beforeEach(() => {
        statesList = new OfMap();

        TestBed.configureTestingModule({
            providers: [ConfigService, {provide: EntitiesService, useClass: EntitiesServiceMock}],
            imports: [StoreModule.forRoot(appReducer),
                      HttpClientTestingModule]
        });
        acknowledgeService = TestBed.inject(AcknowledgeService);
        entitiesService = TestBed.inject(EntitiesService);

        entitiesService.loadAllEntitiesData().subscribe(); // TODO Unsubscribe in aftereach ?

        card = getOneRandomCard({process: 'testProcess', processVersion: '1', state: 'testState', entitiesAllowedToRespond: ['ENTITY1']});
        cardForEntityParent = getOneRandomCard({process: 'testProcess', processVersion: '1', state: 'testState', entitiesAllowedToRespond: ['ALLCONTROLROOMS']});
        userMemberOfEntity1 = new User('userTest', 'firstName', 'lastName', ['group1'], ['ENTITY1']);
        userMemberOfEntity2 = new User('userTest', 'firstName', 'lastName', ['group1'], ['ENTITY2']);
    });


    it('acknowledgmentAllowed of the state is not present , isAcknowledgmentAllowed() must return true (default value)', () => {

        statesList['testState'] = new State(null, null, null,  null);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'testState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('process does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'testState', rights: RightsEnum.Receive}]);
        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, null);
        expect(res).toBeTrue();
    });


    it('state does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {

        statesList['dummyState'] = new State(null, null, null,  null);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'testState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });


    it('acknowledgmentAllowed of the state is Never, isAcknowledgmentAllowed() must return false', () => {

        statesList['testState'] = new State(null, null, null, AcknowledgmentAllowedEnum.NEVER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'testState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is Always, isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null, null, AcknowledgmentAllowedEnum.ALWAYS);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'testState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user cannot respond (user is a member of entity allowed to respond but user rights for the state of the response is Receive), ' +
        'isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null,
                                            new Response(null, 'responseState'),
                                            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
        'isAcknowledgmentAllowed() must return false', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Write}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is ReceiveAndWrite), ' +
        'isAcknowledgmentAllowed() must return false', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.ReceiveAndWrite}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is Receive), ' +
        'isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is Write), ' +
        'isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Write}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is ReceiveAndWrite), ' +
        'isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.ReceiveAndWrite}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user can respond (user is a member of entity allowed to respond (ALLCONTROLROOMS) and user rights for the state of the response is Write), ' +
        'isAcknowledgmentAllowed() must return false', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Write}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, cardForEntityParent, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
        'user cannot respond (user is a member of entity allowed to respond (ALLCONTROLROOMS) but user rights for the state of the response is Receive), ' +
        'isAcknowledgmentAllowed() must return true', () => {

        statesList['testState'] = new State(null, null,
            new Response(null, 'responseState'),
            AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER);
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1,
            [{process: 'testProcess', state: 'responseState', rights: RightsEnum.Receive}]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, cardForEntityParent, processDefinition);
        expect(res).toBeTrue();
    });

});
