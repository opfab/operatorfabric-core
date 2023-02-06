/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ViewChild} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {UserActionLog} from "@ofModel/user-action-log.model";
import {ServerResponseStatus} from "app/business/server/serverResponse";
import {UserActionLogsServer} from "app/business/server/user-action-logs.server";
import moment from "moment";
import {UserActionLogsFiltersComponent} from "./components/useractionlogs-filters/useractionlogs-filters.component";


@Component({
    selector: 'of-useractionlogs',
    templateUrl: './useractionlogs.component.html',
    styleUrls: ['./useractionlogs.component.scss']
})
export class UserActionLogsComponent {

    userActions: UserActionLog[];

    userActionLogsForm = new FormGroup({
        login: new FormControl([]),
        action: new FormControl([]),
        dateFrom: new FormControl<string | null>(null),
        dateTo: new FormControl('')
    });

    @ViewChild('filters') filtersTemplate: UserActionLogsFiltersComponent;

    size = 10;
    page = 1;
    hasResult = false;
    firstQueryHasBeenDone = false;
    loadingInProgress = false;
    technicalError = false;
    totalPages: number;
    totalElements: number;

    defaultMinDate : {year: number; month: number; day: number} = null;

    constructor(private userActionLogsServer: UserActionLogsServer) {
        this.setDefaultPublishDateFilter();
    }

    setDefaultPublishDateFilter() {
        const defaultPublishDateInterval = 10;
        const min = moment(Date.now());
        min.subtract(defaultPublishDateInterval, 'day');
        const minDate = min.toDate();
        this.defaultMinDate = {
            day: minDate.getDate(),
            month: minDate.getMonth() + 1,
            year: minDate.getFullYear()
        };
    }

    sendQuery(): void {
        const {value} = this.userActionLogsForm;
        this.filtersTemplate.transformFiltersListToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.page = 1;
        this.getResults(0);
    }

    private getResults(page_number: number): void {

        this.filtersTemplate.filters.set('page', [page_number]);
        this.hasResult = false;
        this.loadingInProgress = true;

        this.userActionLogsServer.queryUserActionLogs(this.filtersTemplate.filters)
        .subscribe({ next: (actionPageServerResponse) => {
            if (actionPageServerResponse.status === ServerResponseStatus.OK) {
                this.userActions = actionPageServerResponse.data.content;
                this.totalPages = actionPageServerResponse.data.totalPages;
                this.totalElements = actionPageServerResponse.data.totalElements;

                this.loadingInProgress = false;
                this.firstQueryHasBeenDone = true;
                this.hasResult = actionPageServerResponse.data.content.length > 0;
            } else {
                this.firstQueryHasBeenDone = false;
                this.loadingInProgress = false;
                this.technicalError = true;
            }
            
        },});
    }

    pageChange(currentPage: number) {
        this.getResults(currentPage -1);
        this.page = currentPage;
    }

    resetForm(): void {
        this.firstQueryHasBeenDone = false;
        this.loadingInProgress = false;
        this.userActionLogsForm.reset();
        this.userActions = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.page = 1;
        this.hasResult = false;
        this.setDefaultPublishDateFilter();
    }

}