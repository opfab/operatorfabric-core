/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {GroupsService} from 'app/business/services/users/groups.service';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {TemplateCssService} from 'app/business/services/card/template-css.service';
import {UserService} from 'app/business/services/users/user.service';
import {HandlebarsService} from 'app/business/services/card/handlebars.service';
import {debounce, timer, map, catchError, switchMap} from 'rxjs';
import {Utilities} from '../../common/utilities';
import {ApplicationEventsService} from './application-events.service';
import {OpfabEventStreamService} from './opfabEventStream.service';
import {ProcessesService} from '../businessconfig/processes.service';
import {BusinessDataService} from '../businessconfig/businessdata.service';

@Injectable({
    providedIn: 'root'
})
export class ApplicationUpdateService {

    constructor(
        private opfabEventStreamService: OpfabEventStreamService,
        private processService: ProcessesService,
        private handlebarsService: HandlebarsService,
        private templateCssService: TemplateCssService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private groupsService: GroupsService,
        private applicationEventsService: ApplicationEventsService,
        private businessDataService: BusinessDataService
    ) {}

    init() {
        this.listenForBusinessConfigUpdate();
        this.listenForUserConfigUpdate();
        this.listenForBusinessDataUpdate();
    }

    private listenForBusinessConfigUpdate() {
        this.opfabEventStreamService
            .getBusinessConfigChangeRequests()
            .pipe(
                debounce(() => timer(5000 + Math.floor(Math.random() * 5000))),// use a random  part to avoid all UI to access at the same time the server
                map(() => {
                    logger.info('Update business config');
                    this.handlebarsService.clearCache();
                    this.templateCssService.clearCache();
                    this.processService.loadAllProcessesWithLatestVersion().subscribe();
                    this.processService.loadAllProcessesWithAllVersions().subscribe();
                    this.processService.loadProcessGroups().subscribe();
                }),
                catchError((error, caught) => {
                    logger.error('Error in update business config ', error);
                    return caught;
                })
            )
            .subscribe();
    }

    private listenForUserConfigUpdate() {
        this.opfabEventStreamService
            .getUserConfigChangeRequests()
            .pipe(
                debounce(() => timer(5000 + Math.floor(Math.random() * 5000))),  // use a random  part to avoid all UI to access at the same time the server
                switchMap(() => {
                    const requestsToLaunch$ = [
                        this.userService.loadUserWithPerimetersData(),
                        this.entitiesService.loadAllEntitiesData(),
                        this.groupsService.loadAllGroupsData()
                    ];
                    logger.info('Update user perimeter, entities and groups', LogOption.LOCAL_AND_REMOTE);
                    return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$);
                }),
                map(() => this.applicationEventsService.setUserConfigChange()),
                catchError((error, caught) => {
                    logger.error('Error in update user config ', error);
                    return caught;
                })
            )
            .subscribe();
    }

    private listenForBusinessDataUpdate() {
        this.opfabEventStreamService.getBusinessDataChanges().subscribe(() => {
                logger.info(`New business data posted, emptying cache`, LogOption.LOCAL_AND_REMOTE);
                this.businessDataService.emptyCache();
            });
    }
}
