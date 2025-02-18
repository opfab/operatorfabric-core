/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardWithChildCards} from '@ofServices/cards/model/CardWithChildCards';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {Page} from 'app/model/Page';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {CardsService} from '@ofServices/cards/CardsService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UsersService} from '@ofServices/users/UsersService';
import {format, sub} from 'date-fns';
import {map, Observable, of, switchMap} from 'rxjs';
import {UserActionLogLine} from './userActionLogLine';
import {UserActionLogsResult} from './userActionLogsResult';
import {UserActionLogsPageDescription} from './userActionLogsPageDescription';
import {ExcelExport} from '../../utils/excel-export';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {UserActionLogsService} from '@ofServices/userActionLogs/UserActionLogsService';

export class UserActionLogsView {
    private readonly userActionLogPage = new UserActionLogsPageDescription();
    private selectedLogins: string[] = [];
    private selectedActions: string[] = [];
    private dateFrom = 0;
    private dateTo = 0;
    private pageNumber = 0;
    private pageSize = 10;

    constructor() {
        this.initPage();
    }

    private initPage() {
        this.setDefaultFromDate();
        this.userActionLogPage.initialFromDate = new Date(this.dateFrom);
        this.userActionLogPage.isUserAuthorized = this.isUserAuthorized();
        this.userActionLogPage.pageTitle = TranslationService.getTranslation('useractionlogs.title');
        this.userActionLogPage.pageNotAllowedMessage = TranslationService.getTranslation('errors.pageNotAllowed');
        this.userActionLogPage.columnTitle = {
            date: TranslationService.getTranslation('useractionlogs.date'),
            action: TranslationService.getTranslation('useractionlogs.action'),
            login: TranslationService.getTranslation('useractionlogs.login'),
            entities: TranslationService.getTranslation('useractionlogs.entities'),
            cardUid: TranslationService.getTranslation('useractionlogs.cardUid'),
            comment: TranslationService.getTranslation('useractionlogs.comment')
        };
    }

    private setDefaultFromDate() {
        this.dateFrom = sub(Date.now(), {days: 10}).valueOf();
    }

    private isUserAuthorized() {
        return UsersService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN, PermissionEnum.VIEW_USER_ACTION_LOGS]);
    }

    public getUserActionLogPage() {
        return this.userActionLogPage;
    }

    public getAllUserLogins(): Observable<Array<string>> {
        return UsersService.getAll().pipe(
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

    public setPageSize(pageSize: number) {
        this.pageSize = pageSize;
    }

    public search(isForExport: boolean = false): Observable<UserActionLogsResult> {
        if (this.isInvalidDateRange()) {
            return of(this.buildErrorResult('shared.filters.toDateBeforeFromDate'));
        }

        const filters = this.getFiltersForRequest(isForExport);
        return UserActionLogsService.queryUserActionLogs(filters).pipe(
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
        result.errorMessage = TranslationService.getTranslation(messageKey);
        return result;
    }

    private getFiltersForRequest(isForExport: boolean): Map<string, Array<string>> {
        const filters = new Map();

        if (!isForExport) {
            filters.set('size', [this.pageSize.toString()]);
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
        return CardsService.loadArchivedCard(cardUid).pipe(
            switchMap((card) => {
                if (!card) {
                    AlertMessageService.sendAlertMessage({
                        message: TranslationService.getTranslation('feed.selectedCardDeleted'),
                        level: MessageLevel.ERROR
                    });
                    return of(null);
                }
                if (card.card.initialParentCardUid) {
                    return CardsService.loadArchivedCard(card.card.initialParentCardUid);
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
