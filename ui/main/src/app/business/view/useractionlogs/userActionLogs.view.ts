/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardWithChildCards} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {Page} from '@ofModel/page.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {UserActionLogsServer} from 'app/business/server/user-action-logs.server';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {CardService} from 'app/business/services/card/card.service';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {UserService} from 'app/business/services/users/user.service';
import {format, sub} from 'date-fns';
import {map, Observable, of, switchMap} from 'rxjs';
import {UserActionLogLine} from './userActionLogLine';
import {UserActionLogsResult} from './userActionLogsResult';
import {UserActionLogsPageDescription} from './userActionLogsPageDescription';
import {ExcelExport} from '../../common/excel-export';

export class UserActionLogsView {
    private readonly userActionLogPage = new UserActionLogsPageDescription();
    private selectedLogins: string[] = [];
    private selectedActions: string[] = [];
    private dateFrom = 0;
    private dateTo = 0;
    private pageNumber = 0;

    constructor(
        private readonly translationService: TranslationService,
        private readonly userActionLogsServer: UserActionLogsServer
    ) {
        this.initPage();
    }

    private initPage() {
        this.setDefaultFromDate();
        this.userActionLogPage.initialFromDate = new Date(this.dateFrom);
        this.userActionLogPage.isUserAuthorized = this.isUserAuthorized();
        this.userActionLogPage.pageTitle = this.translationService.getTranslation('useractionlogs.title');
        this.userActionLogPage.pageNotAllowedMessage = this.translationService.getTranslation('errors.pageNotAllowed');
        this.userActionLogPage.columnTitle = {
            date: this.translationService.getTranslation('useractionlogs.date'),
            action: this.translationService.getTranslation('useractionlogs.action'),
            login: this.translationService.getTranslation('useractionlogs.login'),
            entities: this.translationService.getTranslation('useractionlogs.entities'),
            cardUid: this.translationService.getTranslation('useractionlogs.cardUid'),
            comment: this.translationService.getTranslation('useractionlogs.comment')
        };
    }

    private setDefaultFromDate() {
        this.dateFrom = sub(Date.now(), {days: 10}).valueOf();
    }

    private isUserAuthorized() {
        return UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN, PermissionEnum.VIEW_USER_ACTION_LOGS]);
    }

    public getUserActionLogPage() {
        return this.userActionLogPage;
    }

    public getAllUserLogins(): Observable<Array<string>> {
        return UserService.getAll().pipe(
            map((users) => {
                return users.map((user) => user.login);
            })
        );
    }

    public setSelectedLogins(logins: string[]) {
        this.selectedLogins = logins;
    }

    public setSelectedActions(actions: string[]) {
        this.selectedActions = actions;
    }

    public setDateFrom(fromDate: number) {
        this.dateFrom = fromDate;
    }

    public setDateTo(toDate: number) {
        this.dateTo = toDate;
    }

    public setPageNumber(pageNumber: number) {
        this.pageNumber = pageNumber;
    }

    public search(isForExport: boolean = false): Observable<UserActionLogsResult> {
        if (this.isInvalidDateRange()) {
            return of(this.buildErrorResult('shared.filters.toDateBeforeFromDate'));
        }

        const filters = this.getFiltersForRequest(isForExport);
        return this.userActionLogsServer.queryUserActionLogs(filters).pipe(
            map((serverResponse) => {
                return this.buildUserActionLogsResult(serverResponse);
            })
        );
    }

    private isInvalidDateRange(): boolean {
        return this.dateTo && this.dateTo < this.dateFrom;
    }

    private buildErrorResult(messageKey: string): UserActionLogsResult {
        const result = new UserActionLogsResult();
        result.hasError = true;
        result.errorMessage = this.translationService.getTranslation(messageKey);
        return result;
    }

    private getFiltersForRequest(isForExport: boolean): Map<string, Array<string>> {
        const filters = new Map();

        if (!isForExport) {
            filters.set('size', ['10']);
        }
        if (this.selectedLogins) {
            filters.set('login', this.selectedLogins);
        }
        if (this.selectedActions) {
            filters.set('action', this.selectedActions);
        }

        if (!isForExport) {
            filters.set('page', [this.pageNumber.toString()]);
        }
        filters.set('dateFrom', [this.dateFrom.toString()]);
        if (this.dateTo) {
            filters.set('dateTo', [this.dateTo.toString()]);
        }
        return filters;
    }

    private buildUserActionLogsResult(serverResponse: ServerResponse<Page<any>>): UserActionLogsResult {
        const result = new UserActionLogsResult();
        const data = serverResponse.data;

        if (serverResponse.status !== ServerResponseStatus.OK) {
            return this.buildErrorResult('shared.error.technicalError');
        }

        if (data.content.length === 0) {
            return this.buildErrorResult('shared.noResult');
        }

        result.data = this.buildPage(data);
        return result;
    }

    private buildPage(data: any): Page<any> {
        const logs = data.content.map((line: any) => this.buildLogLine(line));
        return new Page(data.totalPages, data.totalElements, logs);
    }

    private buildLogLine(line: any): UserActionLogLine {
        const resultLine = new UserActionLogLine();
        resultLine.action = line.action;
        resultLine.date = this.getFormattedDateTime(line.date);
        resultLine.login = line.login;
        resultLine.cardUid = line.cardUid;
        resultLine.comment = line.comment;
        resultLine.entities = this.getEntitiesNames(line.entities);
        return resultLine;
    }

    private getFormattedDateTime(epochDate: number): string {
        return format(epochDate, 'HH:mm:ss dd/MM/yyyy');
    }

    private getEntitiesNames(ids: string[]): string {
        const names = ids.map((id) => EntitiesService.getEntityName(id));
        return names.join();
    }

    public getCard(cardUid: string): Observable<CardWithChildCards> {
        return CardService.loadArchivedCard(cardUid).pipe(
            switchMap((card) => {
                if (!card) {
                    AlertMessageService.sendAlertMessage({
                        message: this.translationService.getTranslation('feed.selectedCardDeleted'),
                        level: MessageLevel.ERROR
                    });
                    return of(null);
                }
                if (card.card.initialParentCardUid) {
                    return CardService.loadArchivedCard(card.card.initialParentCardUid);
                } else {
                    return of(card);
                }
            })
        );
    }

    // EXPORT TO EXCEL
    public initExportData(): void {
        const exportUserActionLogsData = [];

        const dateColumnName = this.userActionLogPage.columnTitle.date;
        const actionColumnName = this.userActionLogPage.columnTitle.action;
        const loginColumnName = this.userActionLogPage.columnTitle.login;
        const entitiesColumnName = this.userActionLogPage.columnTitle.entities;
        const cardUidColumnName = this.userActionLogPage.columnTitle.cardUid;
        const commentColumnName = this.userActionLogPage.columnTitle.comment;

        let userActionLogsForExportResult: UserActionLogsResult = null;
        this.search(true).subscribe((result) => {
            userActionLogsForExportResult = result;
            userActionLogsForExportResult.data.content.forEach((line: UserActionLogLine) => {
                exportUserActionLogsData.push({
                    [dateColumnName]: line.date,
                    [actionColumnName]: line.action,
                    [loginColumnName]: line.login,
                    [entitiesColumnName]: line.entities,
                    [cardUidColumnName]: line.cardUid,
                    [commentColumnName]: line.comment
                });
            });
            ExcelExport.exportJsonToExcelFile(exportUserActionLogsData, 'UserActionLogs');
        });
    }
}
