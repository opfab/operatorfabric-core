/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Filter} from '@ofModel/feed-filter.model';
import {LightCard} from '@ofModel/light-card.model';
import {FilterService} from 'app/business/services/lightcards/filter.service';
import {ProcessesService} from 'app/business/services/processes.service';

@Injectable({
    providedIn: 'root'
})
export class MonitoringFilterBuilder {
    private typeOfStatesFilter: Filter;
    private processFilter: Filter;

    constructor(private filterService: FilterService, private processesService: ProcessesService) {}

    public setProcessList(processesId: string[]) {
        if (processesId.length > 0) {
            this.processFilter = this.getProcessFilter(true, {processes: processesId});
        } else {
            this.processFilter = this.getProcessFilter(false, null);
        }
    }

    private getProcessFilter(active, selectedStatus) {
        return new Filter(
            (card: LightCard, status) => {
                const processList = status.processes;
                if (!!processList) {
                    return processList.includes(card.process);
                }
                return true;
            },
            active,
            selectedStatus
        );
    }

    public setTypeOfStates(typeOfStates: any) {
        if (typeOfStates.length > 0) {
            const typeOfStatesPerProcessAndState = this.processesService.getTypeOfStatesPerProcessAndState();
            this.typeOfStatesFilter = this.getTypeOfStateFilter(true, {
                typeOfStates: typeOfStates,
                mapOfTypeOfStates: typeOfStatesPerProcessAndState
            });
        } else {
            this.typeOfStatesFilter = this.getTypeOfStateFilter(false, null);
        }
    }

    private getTypeOfStateFilter(active, selectedStatus) {
        return new Filter(
            (card: LightCard, status) => {
                const typeOfStatesList = status.typeOfStates;
                if (!!typeOfStatesList) {
                    const typeOfStateOfTheCard = status.mapOfTypeOfStates.get(card.process + '.' + card.state);
                    return typeOfStatesList.includes(typeOfStateOfTheCard);
                }
                return true;
            },
            active,
            selectedStatus
        );
    }

    public getFilters(): Array<Filter> {
        const timelineFilter = this.filterService.getBusinessDateFilter();
        return [timelineFilter, this.processFilter, this.typeOfStatesFilter];
    }
}
