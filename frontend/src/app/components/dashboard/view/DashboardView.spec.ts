/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Dashboard} from './DashboardView';
import {State} from '@ofServices/processes/model/Processes';
import {ComputedPerimeter, UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {getOneLightCard, resetServices, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {firstValueFrom, skip} from 'rxjs';
import {Severity} from 'app/model/Severity';
import {Utilities} from '../../../utils/Utilities';
import {FilterType} from '@ofStore/lightcards/model/Filter';
import {FilteredLightCardsStore} from '../../../store/lightcards/FilteredLightcardsStore';
import {OpfabStore} from '../../../store/OpfabStore';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {DashboardScreenDefinition} from '@ofServices/customScreen/model/DashboardScreenDefinition';
import {ScreenType} from '@ofServices/customScreen/model/ScreenDefinition';

const DASHBOARD_ID = 'dashboard';

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
        },
        {
            id: 'processWithOnlyChildState',
            version: 'v3',
            name: 'process with only child state',
            states: new Map<string, State>([['state1', {name: 'Child state', isOnlyAChildState: true}]])
        }
    ]);
}

describe('Dashboard', () => {
    let dashboard: Dashboard;
    let filteredLightCardStore: FilteredLightCardsStore;
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;

    beforeEach(async () => {
        resetServices();
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();

        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        CustomScreenService.clearCustomScreenDefinitions();
    });

    afterEach(() => {
        dashboard.destroy();
    });

    it('GIVEN an empty process list WHEN get dashboard THEN dashboard is empty', async () => {
        await setProcessConfiguration([]);
        const userWithPerimeters = new UserWithPerimeters(null, new Array(), null, new Map());
        await setUserPerimeter(userWithPerimeters);
        dashboard = new Dashboard(DASHBOARD_ID);
        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles).toHaveSize(0);
    });

    it('GIVEN a process list and user has no perimeters WHEN get dashboard THEN dashboard is empty', async () => {
        await initProcesses();
        const computedPerimeters = new Array();
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);
        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(0);
    });

    it('GIVEN a process list WHEN get dashboard THEN dashboard contains processes', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].type).toEqual('state');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboard.noSeverityColor);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[1].id).toEqual('process2');
        expect(result.tiles[1].label).toEqual('process name 2');
        expect(result.tiles[1].cells.length).toEqual(2);
    });

    it('GIVEN a process with custom screen links in config WHEN get dashboard THEN dashboard contains links', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processCustomLinks = [
            {
                processId: 'process1',
                customLinks: [
                    {
                        customScreenId: 'testId',
                        label: 'My link'
                    },
                    {
                        customScreenId: 'testId2',
                        label: 'My Link 2'
                    }
                ]
            }
        ];
        dashboardScreenDefinition.processStateRedirects = [];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();

        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].type).toEqual('state');
        expect(result.tiles[0].cells[0].label).toEqual('State 1');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[1].type).toEqual('customScreenLink');
        expect(result.tiles[0].cells[1].label).toEqual('My link');
        expect(result.tiles[0].cells[1].id).toEqual('testId');
        expect(result.tiles[0].cells[2].type).toEqual('customScreenLink');
        expect(result.tiles[0].cells[2].label).toEqual('My Link 2');
        expect(result.tiles[0].cells[2].id).toEqual('testId2');
    });

    // Special case: sometimes we want to show custom screen links even if there is no process state visible to the user.
    // However, these links should still be displayed based on the user's permissions.
    //
    // To achieve this, we use a workaround: we add a process with a single child state that is not visible to the user.
    // This process includes custom screen links in its configuration, and we control link visibility by defining access rights for the user to the child state.
    //
    // The two following tests verify that this behavior works as intended.

    it('GIVEN a process with custom screen links in config and only a state with isOnlyAChildState = true  WHEN get dashboard THEN dashboard contains links', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processCustomLinks = [
            {
                processId: 'processWithOnlyChildState',
                customLinks: [
                    {
                        customScreenId: 'testId',
                        label: 'My link'
                    },
                    {
                        customScreenId: 'testId2',
                        label: 'My Link 2'
                    }
                ]
            }
        ];
        dashboardScreenDefinition.processStateRedirects = [];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();

        const computedPerimeters = [
            new ComputedPerimeter('processWithOnlyChildState', 'state1', RightEnum.Receive, true)
        ];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles[0].id).toEqual('processWithOnlyChildState');
        expect(result.tiles[0].label).toEqual('process with only child state');
        expect(result.tiles[0].cells[0].type).toEqual('customScreenLink');
        expect(result.tiles[0].cells[0].label).toEqual('My link');
        expect(result.tiles[0].cells[0].id).toEqual('testId');
        expect(result.tiles[0].cells[1].type).toEqual('customScreenLink');
        expect(result.tiles[0].cells[1].label).toEqual('My Link 2');
        expect(result.tiles[0].cells[1].id).toEqual('testId2');
    });

    it('Given a process with no custom screen links and only a state with isOnlyAChildState = true  WHEN get dashboard THEN dashboard contains no process', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processCustomLinks = [];
        dashboardScreenDefinition.processStateRedirects = [];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('processWithOnlyChildState', 'state1', RightEnum.Receive, true)
        ];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);
        dashboard = new Dashboard(DASHBOARD_ID);
        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(0);
    });

    it('GIVEN a process list and a restricted user perimeter WHEN get dashboard THEN dashboard contains restricted processes ', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[1].id).toEqual('process2');
        expect(result.tiles[1].cells.length).toEqual(1);
    });

    it('GIVEN a process list and an action card in state1 WHEN get dashboard THEN dashboard contains 1 card in process 1 with 1 action circle ', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );

        let result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboard.noSeverityColor);

        const card = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ACTION
        });
        opfabEventStreamServerMock.sendLightCard(card);

        result = await firstValueFrom(dashboard.getDashboardPage().pipe(skip(1)));
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.ACTION));
    });

    it('GIVEN a process list and a card in state1 WHEN add some cards of every severity THEN dashboard contains 4 circles in state 1', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

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
        expect(result.tiles[0].cells[0].circles.length).toEqual(4);

        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].severity).toEqual(Severity.ALARM);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.ALARM));

        expect(result.tiles[0].cells[0].circles[1].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[1].severity).toEqual(Severity.ACTION);
        expect(result.tiles[0].cells[0].circles[1].color).toEqual(Utilities.getSeverityColor(Severity.ACTION));

        expect(result.tiles[0].cells[0].circles[2].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[2].severity).toEqual(Severity.COMPLIANT);
        expect(result.tiles[0].cells[0].circles[2].color).toEqual(Utilities.getSeverityColor(Severity.COMPLIANT));

        expect(result.tiles[0].cells[0].circles[3].numberOfCards).toEqual(2);
        expect(result.tiles[0].cells[0].circles[3].severity).toEqual(Severity.INFORMATION);
        expect(result.tiles[0].cells[0].circles[3].color).toEqual(Utilities.getSeverityColor(Severity.INFORMATION));
    });

    it('GIVEN an acknowledged card WHEN cards get sent THEN dashboard does not contain the card', async () => {
        await initProcesses();
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

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
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });

    it('GIVEN a card today WHEN date filter is set to the past THEN dashboard does not contain the card', async () => {
        await initProcesses();
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

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
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.INFORMATION));

        filteredLightCardStore.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {start: 0, end: 1});

        result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboard.noSeverityColor);
    });

    it('GIVEN a processList in config with one process WHEN get dashboard THEN dashboard only contains the listed process', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = ['process1'];
        dashboardScreenDefinition.processCustomLinks = [];
        dashboardScreenDefinition.processStateRedirects = [];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(1);
        expect(result.tiles[0].id).toEqual('process1');
    });

    it('GIVEN a processList in config WHEN user has no rights on a listed process THEN that process is not shown', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = ['process1', 'process2'];
        dashboardScreenDefinition.processCustomLinks = [];
        dashboardScreenDefinition.processStateRedirects = [];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();
        // User only has rights on process1, not on process2
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboard = new Dashboard(DASHBOARD_ID);

        const result = await firstValueFrom(dashboard.getDashboardPage());
        expect(result.tiles.length).toEqual(1);
        expect(result.tiles[0].id).toEqual('process1');
    });
});
