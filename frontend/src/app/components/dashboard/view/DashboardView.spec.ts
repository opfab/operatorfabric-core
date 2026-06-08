/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DashboardView} from './DashboardView';
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
import {DashboardScreenDefinition} from '@ofServices/customScreen/dashboard/DashboardScreenDefinition';
import {ScreenType} from '@ofServices/customScreen/ScreenDefinition';
import {CardListScreenDefinition} from '@ofServices/customScreen/cardList/CardListScreenDefinition';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {BusinessPeriodInitState} from '../../customScreen/BusinessPeriodInitState';

const DASHBOARD_ID = 'dashboard';
const ONE_HOUR = 3600 * 1000;

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
    let dashboardView: DashboardView;
    let filteredLightCardStore: FilteredLightCardsStore;
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;

    function activateBusinessAndPublishDateFilter(start: number, end: number): void {
        filteredLightCardStore.updateFilter(FilterType.BUSINESSANDPUBLISHDATE_FILTER, true, {start, end});
    }

    beforeEach(async () => {
        resetServices();
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();

        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        RealTimeDomainService.init();
        CustomScreenService.clearCustomScreenDefinitions();
    });

    afterEach(() => {
        dashboardView.destroy();
    });

    it('GIVEN an empty process list WHEN get dashboard THEN dashboard is empty', async () => {
        await setProcessConfiguration([]);
        const userWithPerimeters = new UserWithPerimeters(null, new Array(), null, new Map());
        await setUserPerimeter(userWithPerimeters);
        dashboardView = new DashboardView(DASHBOARD_ID);
        const result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles).toHaveSize(0);
    });

    it('GIVEN a process list and user has no perimeters WHEN get dashboard THEN dashboard is empty', async () => {
        await initProcesses();
        const computedPerimeters = new Array();
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);
        const result = await firstValueFrom(dashboardView.getDashboardPage());
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

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].type).toEqual('state');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[1].id).toEqual('process2');
        expect(result.tiles[1].label).toEqual('process name 2');
        expect(result.tiles[1].cells.length).toEqual(2);
    });

    it('GIVEN a process list and a restricted user perimeter WHEN get dashboard THEN dashboard contains restricted processes ', async () => {
        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());
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

        dashboardView = new DashboardView(DASHBOARD_ID);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );

        let result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles.length).toEqual(2);
        expect(result.tiles[0].id).toEqual('process1');
        expect(result.tiles[0].label).toEqual('process name');
        expect(result.tiles[0].cells[0].id).toEqual('state1');
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);

        const card = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.ACTION
        });
        opfabEventStreamServerMock.sendLightCard(card);

        result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
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

        dashboardView = new DashboardView(DASHBOARD_ID);

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
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );

        const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
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

        dashboardView = new DashboardView(DASHBOARD_ID);

        const infoCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION,
            hasBeenAcknowledged: true
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );

        const result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);
    });

    it('GIVEN a card today WHEN date filter is set to the past THEN dashboard does not contain the card', async () => {
        await initProcesses();
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const infoCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            severity: Severity.INFORMATION
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );
        let result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.INFORMATION));

        filteredLightCardStore.updateFilter(FilterType.BUSINESSANDPUBLISHDATE_FILTER, true, {start: 0, end: 1});

        result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);
        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);
    });

    it('GIVEN a processList in config with one process WHEN get dashboard THEN dashboard only contains the listed process', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = ['process1'];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();
        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles.length).toEqual(1);
        expect(result.tiles[0].id).toEqual('process1');
    });

    it('GIVEN a processList in config WHEN user has no rights on a listed process THEN that process is not shown', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = ['process1', 'process2'];
        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();
        // User only has rights on process1, not on process2
        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());
        expect(result.tiles.length).toEqual(1);
        expect(result.tiles[0].id).toEqual('process1');
    });

    it('GIVEN a dashboard with custom tiles WHEN get dashboard THEN dashboard contains custom tiles', async () => {
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;

        dashboardScreenDefinition.customTiles = [
            {
                title: 'My custom tile 1',
                cells: [
                    {
                        label: 'Custom screen',
                        customScreenId: 'testId'
                    },
                    {
                        label: 'Custom screen 2',
                        customScreenId: 'testId2'
                    }
                ]
            }
        ];

        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        await initProcesses();

        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());

        const customTile = result.tiles.find((t) => t.label === 'My custom tile 1');

        expect(customTile).toBeDefined();
        expect(customTile.cells.length).toEqual(2);
        expect(customTile.cells[0].type).toEqual('customScreenLink');
        expect(customTile.cells[0].id).toEqual('testId');
    });

    it('GIVEN only custom tiles WHEN get dashboard THEN dashboard contains only custom tiles', async () => {
        await initProcesses();
        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;

        dashboardScreenDefinition.customTiles = [
            {
                title: 'Only custom tile',
                cells: [
                    {
                        label: 'Custom screen',
                        customScreenId: 'testId'
                    }
                ]
            }
        ];

        dashboardScreenDefinition.processList = [];

        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());

        expect(result.tiles.length).toEqual(1);
        expect(result.tiles[0].label).toEqual('Only custom tile');
    });

    it('GIVEN process tiles and custom tiles WHEN get dashboard THEN both are displayed', async () => {
        await initProcesses();

        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;

        dashboardScreenDefinition.customTiles = [
            {
                title: 'Custom tile',
                cells: [
                    {
                        label: 'Custom screen',
                        customScreenId: 'testId'
                    }
                ]
            }
        ];

        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

        const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];

        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

        const result = await firstValueFrom(dashboardView.getDashboardPage());

        expect(result.tiles.length).toBeGreaterThanOrEqual(2);

        expect(result.tiles.some((t) => t.id === 'process1')).toBeTrue();
        expect(result.tiles.some((t) => t.label === 'Custom tile')).toBeTrue();
    });

    it('GIVEN all cards visible in custom card list screen WHEN cards get sent THEN custom tiles contains bubbles', async () => {
        await initProcesses();

        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = []; // No process tile, only custom tile

        dashboardScreenDefinition.customTiles = [
            {
                title: 'Custom tile',
                cells: [
                    {
                        label: 'Custom screen',
                        customScreenId: 'testId'
                    }
                ]
            }
        ];

        const cardListScreenDefinition = new CardListScreenDefinition();
        cardListScreenDefinition.id = 'testId';
        cardListScreenDefinition.name = 'testName';

        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);
        CustomScreenService.addCustomScreenDefinition(cardListScreenDefinition);

        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

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
            process: 'process2',
            state: 'state1',
            severity: Severity.COMPLIANT,
            id: 'compliantCard'
        });
        const actionCard = getOneLightCard({
            process: 'process2',
            state: 'state1',
            severity: Severity.ACTION,
            id: 'actionCard'
        });
        const alarmCard = getOneLightCard({
            process: 'process2',
            state: 'state2',
            severity: Severity.ALARM,
            id: 'alarmCard'
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        opfabEventStreamServerMock.sendLightCard(infoCard2);
        opfabEventStreamServerMock.sendLightCard(compliantCard);
        opfabEventStreamServerMock.sendLightCard(actionCard);
        opfabEventStreamServerMock.sendLightCard(alarmCard);

        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );

        const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
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

    it('GIVEN some cards visible in custom card list screen WHEN cards get sent THEN custom tiles contains bubbles', async () => {
        await initProcesses();

        const dashboardScreenDefinition = new DashboardScreenDefinition();
        dashboardScreenDefinition.id = 'dashboard';
        dashboardScreenDefinition.name = 'Dashboard';
        dashboardScreenDefinition.type = ScreenType.DASHBOARD;
        dashboardScreenDefinition.processList = []; // No process tile, only custom tile

        dashboardScreenDefinition.customTiles = [
            {
                title: 'Custom tile',
                cells: [
                    {
                        label: 'Custom screen',
                        customScreenId: 'testId'
                    }
                ]
            }
        ];

        const cardListScreenDefinition = new CardListScreenDefinition();
        cardListScreenDefinition.id = 'testId';
        cardListScreenDefinition.name = 'testName';
        cardListScreenDefinition.statesToExclude = [{processId: 'process2', stateIds: ['state1', 'state2']}];

        CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);
        CustomScreenService.addCustomScreenDefinition(cardListScreenDefinition);

        const computedPerimeters = [
            new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2', RightEnum.Receive, true),
            new ComputedPerimeter('process2', 'state3', RightEnum.Receive, true)
        ];
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, null, new Map());
        await setUserPerimeter(userWithPerimeters);

        dashboardView = new DashboardView(DASHBOARD_ID);

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
            process: 'process2',
            state: 'state1',
            severity: Severity.COMPLIANT,
            id: 'compliantCard'
        });
        const actionCard = getOneLightCard({
            process: 'process2',
            state: 'state1',
            severity: Severity.ACTION,
            id: 'actionCard'
        });
        const alarmCard = getOneLightCard({
            process: 'process2',
            state: 'state2',
            severity: Severity.ALARM,
            id: 'alarmCard'
        });
        opfabEventStreamServerMock.sendLightCard(infoCard);
        opfabEventStreamServerMock.sendLightCard(infoCard2);
        opfabEventStreamServerMock.sendLightCard(compliantCard);
        opfabEventStreamServerMock.sendLightCard(actionCard);
        opfabEventStreamServerMock.sendLightCard(alarmCard);

        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSANDPUBLISHDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessAndPublishDateFilter().status
        );

        const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
        expect(result.tiles[0].cells[0].circles.length).toEqual(1);

        expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(2);
        expect(result.tiles[0].cells[0].circles[0].severity).toEqual(Severity.INFORMATION);
        expect(result.tiles[0].cells[0].circles[0].color).toEqual(Utilities.getSeverityColor(Severity.INFORMATION));
    });
    describe('Business period filtering (startDate and endDate only, publishDate ignored)', () => {
        beforeEach(async () => {
            await initProcesses();
            const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
            await setUserPerimeter(new UserWithPerimeters(null, computedPerimeters, null, new Map()));
            const dashboardScreenDefinition = new DashboardScreenDefinition();
            dashboardScreenDefinition.id = DASHBOARD_ID;
            dashboardScreenDefinition.type = ScreenType.DASHBOARD;
            CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);
            dashboardView = new DashboardView(DASHBOARD_ID);
        });

        it('GIVEN a card with startDate inside the business period and publishDate outside WHEN date filter is active THEN dashboard shows the card', async () => {
            const now = Date.now();
            const periodStart = now - ONE_HOUR; // 1 hour ago
            const periodEnd = now + ONE_HOUR; // 1 hour from now

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                severity: Severity.INFORMATION,
                publishDate: now - 10 * ONE_HOUR, // 10 hours ago — outside period
                startDate: now, // now — inside period
                endDate: null
            });
            opfabEventStreamServerMock.sendLightCard(card);
            activateBusinessAndPublishDateFilter(periodStart, periodEnd);

            const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
            expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        });

        it('GIVEN a card with publishDate inside the business period but startDate after the period and no endDate WHEN date filter is active THEN dashboard does not show the card', async () => {
            const now = Date.now();
            const periodStart = now - ONE_HOUR; // 1 hour ago
            const periodEnd = now + ONE_HOUR; // 1 hour from now

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                severity: Severity.INFORMATION,
                publishDate: now, // now — inside period
                startDate: now + 2 * ONE_HOUR, // 2 hours from now — after period end
                endDate: null
            });
            opfabEventStreamServerMock.sendLightCard(card);
            activateBusinessAndPublishDateFilter(periodStart, periodEnd);

            const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
            expect(result.tiles[0].cells[0].circles.length).toEqual(1);
            expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
            expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);
        });

        it('GIVEN a card with startDate and endDate both after the business period WHEN date filter is active THEN dashboard does not show the card', async () => {
            const now = Date.now();
            const periodStart = now - 3600 * 1000; // 1 hour ago
            const periodEnd = now; // now

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                severity: Severity.INFORMATION,
                startDate: now + ONE_HOUR, // 1 hour from now — after period
                endDate: now + 2 * ONE_HOUR // 2 hours from now — after period
            });
            opfabEventStreamServerMock.sendLightCard(card);
            activateBusinessAndPublishDateFilter(periodStart, periodEnd);

            const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
            expect(result.tiles[0].cells[0].circles.length).toEqual(1);
            expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(0);
            expect(result.tiles[0].cells[0].circles[0].color).toEqual(dashboardView.noSeverityColor);
        });

        it('GIVEN a card whose startDate is before and endDate is after the business period WHEN date filter is active THEN dashboard shows the card', async () => {
            const now = Date.now();
            const periodStart = now;
            const periodEnd = now + 3600 * 1000; // 1 hour from now

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                severity: Severity.INFORMATION,
                startDate: now - ONE_HOUR, // 1 hour before period start
                endDate: now + 2 * ONE_HOUR // 1 hour after period end
            });
            opfabEventStreamServerMock.sendLightCard(card);
            activateBusinessAndPublishDateFilter(periodStart, periodEnd);

            const result = await firstValueFrom(dashboardView.getDashboardPage().pipe(skip(1)));
            expect(result.tiles[0].cells[0].circles[0].numberOfCards).toEqual(1);
        });
    });

    describe('GIVEN initialBusinessPeriod is set to FROM_TODAY_TO_YEAR_END', () => {
        it('WHEN dashboard is created THEN business period is set to current year end', async () => {
            await initProcesses();

            const dashboardScreenDefinition = new DashboardScreenDefinition();
            dashboardScreenDefinition.id = DASHBOARD_ID;
            dashboardScreenDefinition.type = ScreenType.DASHBOARD;
            dashboardScreenDefinition.initialBusinessPeriod = 'FROM_TODAY_TO_YEAR_END';

            CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

            const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
            await setUserPerimeter(new UserWithPerimeters(null, computedPerimeters, null, new Map()));

            const today = new Date();

            BusinessPeriodInitState.reset();
            dashboardView = new DashboardView(DASHBOARD_ID);

            const domain = RealTimeDomainService.getCurrentDomain();

            const start = new Date(domain.startDate);
            const end = new Date(domain.endDate);

            // START = today
            expect(start.getFullYear()).toEqual(today.getFullYear());
            expect(start.getMonth()).toEqual(today.getMonth());
            expect(start.getDate()).toEqual(today.getDate());
            expect(start.getHours()).toEqual(0);
            expect(start.getMinutes()).toEqual(0);

            // END = end of year
            expect(end.getFullYear()).toEqual(today.getFullYear());
            expect(end.getMonth()).toEqual(11); // December
            expect(end.getDate()).toEqual(31);
            expect(end.getHours()).toEqual(23);
            expect(end.getMinutes()).toEqual(59);
        });

        it('WHEN user changes business period and reopen the dashsboard screen THEN FROM_TODAY_TO_YEAR_END is not reapplied', async () => {
            await initProcesses();

            const dashboardScreenDefinition = new DashboardScreenDefinition();
            dashboardScreenDefinition.id = DASHBOARD_ID;
            dashboardScreenDefinition.type = ScreenType.DASHBOARD;
            dashboardScreenDefinition.initialBusinessPeriod = 'FROM_TODAY_TO_YEAR_END';

            CustomScreenService.addCustomScreenDefinition(dashboardScreenDefinition);

            const computedPerimeters = [new ComputedPerimeter('process1', 'state1', RightEnum.Receive, true)];
            await setUserPerimeter(new UserWithPerimeters(null, computedPerimeters, null, new Map()));

            // First open: sets the period and the deactivation flag
            BusinessPeriodInitState.reset();
            dashboardView = new DashboardView(DASHBOARD_ID);
            dashboardView.destroy();

            // Simulate user changing the period
            const customStart = new Date(2020, 0, 1).getTime();
            const customEnd = new Date(2020, 11, 31).getTime();
            RealTimeDomainService.setStartAndEndPeriod(customStart, customEnd);

            // Second open: session flag is set, FROM_TODAY_TO_YEAR_END should not be re-applied
            dashboardView = new DashboardView(DASHBOARD_ID);

            const domain = RealTimeDomainService.getCurrentDomain();
            expect(domain.startDate).toEqual(customStart);
            expect(domain.endDate).toEqual(customEnd);
        });
    });
});
