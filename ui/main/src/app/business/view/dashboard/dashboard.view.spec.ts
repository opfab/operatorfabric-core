/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Dashboard} from './dashboard.view';
import {State} from '@ofServices/processes/model/Processes';
import {ComputedPerimeter, UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {RightsEnum} from '@ofModel/perimeter.model';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {getOneLightCard, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {firstValueFrom, skip} from 'rxjs';
import {Severity} from '@ofModel/light-card.model';
import {Utilities} from 'app/business/common/utilities';
import {FilterType} from '@ofModel/feed-filter.model';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {OpfabStore} from 'app/business/store/opfabStore';

describe('Dashboard', () => {
    let dashboard: Dashboard;
    let filteredLightCardStore: FilteredLightCardsStore;
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;

    beforeEach(async () => {
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();

        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    });

    afterEach(() => {
        dashboard.destroy();
    });

    async function initProcesses() {
        await setProcessConfiguration([
            {
                id: 'process1',
                version: 'v1',
                name: 'process name',
                states: new Map<string, State>([['state1', {name: 'State 1'}]])
            },
            {
                id: 'process2',
                version: 'v2',
                name: 'process name 2',
                states: new Map<string, State>([
                    ['state2', {name: 'State 2'}],
                    ['state3', {name: 'State 3'}],
                    ['childState', {name: 'child state', isOnlyAChildState: true}]
                ])
            }
        ]);
    }

    it('GIVEN an empty process list WHEN get dashboard THEN dashboard is empty', async () => {
        await setProcessConfiguration([]);
        const userWithPerimeters = new UserWithPerimeters(null, new Array(), null, new Map());
        await setUserPerimeter(userWithPerimeters);
        dashboard = new Dashboard();
        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes).toHaveSize(0);
    });

    it('GIVEN a process list and user has no perimeters WHEN get dashboard THEN dashboard is empty', async () => {
        await initProcesses();
        const computedPerimeters = new Array();
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();
        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(0);
    });

    it('GIVEN a process list WHEN get dashboard THEN dashboard contains processes', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true)
        ];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();

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
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[1].id).toEqual('process2');
        expect(result.processes[1].states.length).toEqual(1);
    });

    it('GIVEN a process list and an action card in state1 WHEN get dashboard THEN dashboard contains 1 card in process 1 with 1 action circle ', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );

        let result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes.length).toEqual(2);
        expect(result.processes[0].id).toEqual('process1');
        expect(result.processes[0].name).toEqual('process name');
        expect(result.processes[0].states[0].id).toEqual('state1');
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);

        const card = getOneLightCard({
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
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightsEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();

        const infoCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION,
            id: 'infoCard'
        });
        const infoCard2 = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION,
            id: 'infoCard2'
        });
        const compliantCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.COMPLIANT,
            id: 'compliantCard'
        });
        const actionCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ACTION,
            id: 'actionCard'
        });
        const alarmCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ALARM,
            id: 'alarmCard'
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        opfabEventStreamServerMock.sendLightCard(infoCard2);
        opfabEventStreamServerMock.sendLightCard(compliantCard);
        opfabEventStreamServerMock.sendLightCard(actionCard);
        opfabEventStreamServerMock.sendLightCard(alarmCard);

        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );

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
        await initProcesses();
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();

        const infoCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION,
            hasBeenAcknowledged: true
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });

    it('GIVEN a card today WHEN date filter is set to the past THEN dashboard does not contain the card', async () => {
        await initProcesses();
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightsEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard();

        const infoCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );
        let result = await firstValueFrom(dashboard.getDashboardPage().pipe(skip(1)));
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(1);
        expect(result.processes[0].states[0].circles[0].color).toEqual(
            Utilities.getSeverityColor(Severity.INFORMATION)
        );

        filteredLightCardStore.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {start: 0, end: 1});

        result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.processes[0].states[0].circles.length).toEqual(1);
        expect(result.processes[0].states[0].circles[0].numberOfCards).toEqual(0);
        expect(result.processes[0].states[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });
});
