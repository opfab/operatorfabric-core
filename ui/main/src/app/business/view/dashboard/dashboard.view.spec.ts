/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {Dashboard} from './dashboard.view';
import {UserService} from 'app/business/services/users/user.service';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {Process, State} from '@ofModel/processes.model';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {getOneRandomLightCard} from '@tests/helpers';
import {firstValueFrom, skip} from 'rxjs';
import {Severity} from '@ofModel/light-card.model';
import {Utilities} from 'app/business/common/utilities';
import {FilterType} from '@ofModel/feed-filter.model';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';

describe('Dashboard', () => {
    let dashboard: Dashboard;
    let userServerMock: UserServerMock;
    let processServerMock: ProcessServerMock;
    let lightCardsStoreService: LightCardsStoreService;
    let lightCardsFeedFilterService: LightCardsFeedFilterService;
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;

    beforeEach(() => {
        userServerMock = new UserServerMock();
        UserService.setUserServer(userServerMock);
        processServerMock = new ProcessServerMock();
        ProcessesService.setProcessServer(processServerMock);

        opfabEventStreamServerMock = new OpfabEventStreamServerMock();

        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);

        lightCardsStoreService = new LightCardsStoreService(
            new SelectedCardService()
        );
        lightCardsFeedFilterService = new LightCardsFeedFilterService(
            lightCardsStoreService,
            new GroupedCardsService()
        );
        lightCardsStoreService.initStore();
    });

    async function initProcesses() {
        const states1 = new Map<string, State>();
        const state1 = new State();
        state1.name = 'State 1';
        states1.set('state1', state1);

        const states2 = new Map<string, State>();
        const state2 = new State();
        state2.name = 'State 2';
        states2.set('state2', state2);
        const state3 = new State();
        state3.name = 'State 3';
        states2.set('state3', state3);
        const childState = new State();
        childState.name = 'child state';
        childState.isOnlyAChildState = true;
        states2.set('childState', childState);

        const processes = new Array();
        const process1 = new Process('process1', 'v1', 'process name', undefined, states1);
        const process2 = new Process('process2', 'v2', 'process name 2', undefined, states2);
        processes.push(process1);
        processes.push(process2);
        processServerMock.setResponseForAllProcessDefinition(
            new ServerResponse(processes, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(ProcessesService.loadAllProcessesWithLatestVersion());
        await firstValueFrom(ProcessesService.loadAllProcessesWithAllVersions());
    }

    it('GIVEN an empty process list WHEN get dashboard THEN dashboard is empty', async () => {
        const processes = new Array();
        processServerMock.setResponseForAllProcessDefinition(
            new ServerResponse(processes, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(ProcessesService.loadAllProcessesWithLatestVersion());
        await firstValueFrom(ProcessesService.loadAllProcessesWithAllVersions());
        const userWithPerimeters = new UserWithPerimeters(null, new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(userWithPerimeters, null, null));

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes).toHaveSize(0);
    });

    it('GIVEN a process list and user has no perimeters WHEN get dashboard THEN dashboard is empty', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(0);
    });

    it('GIVEN a process list WHEN get dashboard THEN dashboard contains processes', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        const computedPerimeter2 = new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true);
        const computedPerimeter3 = new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter);
        computedPerimeters.push(computedPerimeter2);
        computedPerimeters.push(computedPerimeter3);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[0].name).toEqual('process name');
        expect(result.processes[0].states[0].id).toEqual('state1');
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[1].id).toEqual('process2');
        expect(result.processes[1].name).toEqual('process name 2');
        expect(result.processes[1].states.length).toEqual(2);
    });

    it('GIVEN a process list and a restricted user perimeter WHEN get dashboard THEN dashboard contains restricted processes ', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        const computedPerimeter2 = new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter);
        computedPerimeters.push(computedPerimeter2);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[1].id).toEqual('process2');
        expect(result.processes[1].states.length).toEqual(1);
    });

    it('GIVEN a process list and an action card in state1 WHEN get dashboard THEN dashboard contains 1 card in process 1 with 1 action circle ', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        const computedPerimeter2 = new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true);
        const computedPerimeter3 = new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter);
        computedPerimeters.push(computedPerimeter2);
        computedPerimeters.push(computedPerimeter3);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        let result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[0].name).toEqual('process name');
        expect(result.processes[0].states[0].id).toEqual('state1');
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);

        const card = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ACTION
        });
        opfabEventStreamServerMock.sendLightCard(card);

        result = await firstValueFrom(dashboard.getDashboardPage().pipe(skip(1)));
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[0].name).toEqual('process name');
        expect(result.processes[0].states[0].id).toEqual('state1');
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.ACTION));
    });

    it('GIVEN a process list and a card in state1 WHEN add some cards of every severity THEN dashboard contains 4 circles in state 1', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter1 = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        const computedPerimeter2 = new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true);
        const computedPerimeter3 = new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter1);
        computedPerimeters.push(computedPerimeter2);
        computedPerimeters.push(computedPerimeter3);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);

        const infoCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION
        });
        const infoCard2 = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION
        });
        const compliantCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.COMPLIANT
        });
        const actionCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ACTION
        });
        const alarmCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ALARM
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        opfabEventStreamServerMock.sendLightCard(infoCard2);
        opfabEventStreamServerMock.sendLightCard(compliantCard);
        opfabEventStreamServerMock.sendLightCard(actionCard);
        opfabEventStreamServerMock.sendLightCard(alarmCard);

        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage().pipe(skip(1)));
        expect(result.processes[0].states[0].circles.length).toEqual(4);

        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[0].severity).toEqual(Severity.ALARM);
        expect(result.processes[0].states[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.ALARM));

        expect(result.processes[0].states[0].circles[1].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[1].severity).toEqual(Severity.ACTION);
        expect(result.processes[0].states[0].circles[1].color).toEqual(Utilities.getSeverityColor(Severity.ACTION));

        expect(result.processes[0].states[0].circles[2].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[2].severity).toEqual(Severity.COMPLIANT);
        expect(result.processes[0].states[0].circles[2].color).toEqual(Utilities.getSeverityColor(Severity.COMPLIANT));

        expect(result.processes[0].states[0].circles[3].numberOfCards).toEqual(2);
        expect(result.processes[0].states[0].circles[3].severity).toEqual(Severity.INFORMATION);
        expect(result.processes[0].states[0].circles[3].color).toEqual(
            Utilities.getSeverityColor(Severity.INFORMATION)
        );
    });

    it('GIVEN an acknowledged card WHEN cards get sent THEN dashboard does not contain the card', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter1 = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter1);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);

        const infoCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION,
            hasBeenAcknowledged: true
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });

    it('GIVEN a card today WHEN date filter is set to the past THEN dashboard does not contain the card', async () => {
        initProcesses();
        const computedPerimeters = new Array();
        const computedPerimeter1 = new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true);
        computedPerimeters.push(computedPerimeter1);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());

        dashboard = new Dashboard(lightCardsStoreService, lightCardsFeedFilterService);

        const infoCard = getOneRandomLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, lightCardsFeedFilterService.getBusinessDateFilter().status);
        let result = await firstValueFrom(dashboard.getDashboardPage().pipe(skip(1)));
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[0].color).toEqual(
            Utilities.getSeverityColor(Severity.INFORMATION)
        );

        lightCardsFeedFilterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {start: 0, end: 1});

        result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });
});
