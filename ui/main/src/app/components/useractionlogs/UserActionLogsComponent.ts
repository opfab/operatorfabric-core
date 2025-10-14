/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    inject
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Card} from 'app/model/Card';
import {UserActionLogsView} from 'app/components/useractionlogs/view/UserActionLogsView';
import {UserActionLogsResult} from 'app/components/useractionlogs/view/UserActionLogsResult';
import {UserActionLogsPageDescription} from 'app/components/useractionlogs/view/UserActionLogsPageDescription';
import {NgTemplateOutlet} from '@angular/common';
import {MultiSelectComponent} from '../share/multi-select/MultiSelectComponent';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../share/spinner/SpinnerComponent';
import {ArchivedCardDetailComponent} from '../archives/components/archived-card-detail/ArchivedCardDetailComponent';
import {OpfabTitleCasePipe} from '../share/pipes/OpfabTitleCasePipe';
import {MultiSelectConfig, MultiSelectOption} from '../share/multi-select/model/MultiSelect';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {DateRangePickerConfig} from '../../utils/DateRangePickerConfig';

@Component({
    selector: 'of-useractionlogs',
    templateUrl: './UserActionLogsComponent.html',
    styleUrls: ['./UserActionLogsComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MultiSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        NgbPagination,
        SpinnerComponent,
        ArchivedCardDetailComponent,
        OpfabTitleCasePipe,
        NgxDaterangepickerMd,
        NgTemplateOutlet
    ]
})
export class UserActionLogsComponent implements OnInit, OnDestroy {
    private readonly modalService = inject(NgbModal);
    private readonly changeDetector = inject(ChangeDetectorRef);

    userActionLogsView: UserActionLogsView;
    userActionLogsPage: UserActionLogsPageDescription;
    userActionLogsResult: UserActionLogsResult;

    pageSize: number = 10;

    readonly paginationPageSizeOptions = [10, 20, 50, 100];

    userActionLogsForm: FormGroup;
    loginMultiSelectConfig: MultiSelectConfig;
    actionsMultiSelectConfig: MultiSelectConfig;

    logins: Array<MultiSelectOption> = [];
    actions = [];
    loginsSelected = [];
    actionsSelected = [];
    loginListLoaded = false;
    loadingInProgress = false;
    errorMessage;
    currentResultPage = 1;

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    cardLoadingInProgress = false;
    selectedCard: Card;
    selectedChildCards: Card[];

    readonly locale = DateRangePickerConfig.getLocale();
    readonly ranges = DateRangePickerConfig.getCustomRanges();

    constructor() {
        this.userActionLogsView = new UserActionLogsView();
        this.userActionLogsPage = this.userActionLogsView.getUserActionLogPage();
    }

    ngOnInit() {
        const savedPageSize = UserPreferencesService.getPreference('opfab.useractionlogs.page.size');
        if (savedPageSize) this.pageSize = parseInt(savedPageSize);
        this.initForm();
        this.setInitialDateFrom();
        this.initActionMultiselect();
        this.initLoginMultiselect();
    }

    private initForm() {
        this.userActionLogsForm = new FormGroup({
            login: new FormControl([]),
            action: new FormControl([]),
            dateRange: new FormControl({})
        });
    }

    private setInitialDateFrom() {
        const initDate = this.userActionLogsPage.initialFromDate;

        const startOfDay = new Date(initDate);
        startOfDay.setHours(0, 0, 0, 0);

        this.userActionLogsForm.controls.dateRange?.setValue({
            startDate: startOfDay,
            endDate: null
        });
    }

    private initLoginMultiselect() {
        this.loginMultiSelectConfig = {
            labelKey: 'useractionlogs.filters.login',
            placeholderKey: 'useractionlogs.login',
            sortOptions: true,
            nbOfDisplayValues: 1
        };
        this.userActionLogsView.getAllUserLogins().subscribe((loginList) => {
            loginList.forEach((login) => this.logins.push(new MultiSelectOption(login, login)));
            this.loginListLoaded = true;
            this.changeDetector.markForCheck();
        });
    }

    private initActionMultiselect() {
        this.actionsMultiSelectConfig = {
            labelKey: 'useractionlogs.filters.action',
            placeholderKey: 'useractionlogs.action',
            sortOptions: true,
            nbOfDisplayValues: 1
        };
        this.userActionLogsPage.actionList.forEach((action) =>
            this.actions.push(new MultiSelectOption(action, action))
        );
    }

    search(page) {
        this.setViewParametersFromForm(page);
        this.loadingInProgress = true;
        this.userActionLogsResult = null;
        this.errorMessage = null;
        this.userActionLogsView.setPageSize(this.pageSize);
        this.userActionLogsView.search().subscribe((result) => {
            if (result.hasError) {
                this.errorMessage = result.errorMessage;
            } else {
                this.userActionLogsResult = result;
            }
            this.loadingInProgress = false;
            this.changeDetector.markForCheck();
        });
    }

    splitOnLineBreaks(text: string): string[] {
        return text ? text.split('\n') : [];
    }

    private setViewParametersFromForm(page) {
        const logins = this.userActionLogsForm.get('login').value;
        const actions = this.userActionLogsForm.get('action').value;

        const dates = this.userActionLogsForm.get('dateRange').value as {startDate: string; endDate: string};
        const startDate = Date.parse(dates.startDate);
        const endDate = Date.parse(dates.endDate);

        this.userActionLogsView.setSelectedLogins(logins);
        this.userActionLogsView.setSelectedActions(actions);
        this.userActionLogsView.setDateFrom(startDate);
        this.userActionLogsView.setDateTo(endDate);
        if (page) {
            this.userActionLogsView.setPageNumber(page);
            this.currentResultPage = page + 1;
        } else {
            this.userActionLogsView.setPageNumber(0);
            this.currentResultPage = 1;
        }
    }

    changePage(page) {
        this.search(page - 1);
    }

    onPageSizeChanged(target: EventTarget | null) {
        if (target) {
            this.pageSize = Number((<HTMLSelectElement>target).value);
            UserPreferencesService.setPreference('opfab.useractionlogs.page.size', this.pageSize);
            this.search(0);
        }
    }

    clickOnCard(cardUid) {
        if (cardUid) {
            this.cardLoadingInProgress = true;
            this.userActionLogsView.getCard(cardUid).subscribe((card) => {
                this.cardLoadingInProgress = false;
                if (card) {
                    this.selectedCard = card.card;
                    this.selectedChildCards = card.childCards;

                    const options: NgbModalOptions = {
                        size: 'fullscreen'
                    };
                    if (this.modalRef) this.modalRef.close();
                    this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
                } else if (this.modalRef) this.modalRef.close();
            });
        }
    }

    export(): void {
        this.userActionLogsView.initExportData();
    }

    reset() {
        this.userActionLogsForm.reset();
        this.loginsSelected = [];
        this.actionsSelected = [];
        this.userActionLogsResult = null;
        this.errorMessage = null;
        this.setInitialDateFrom();
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }
}
