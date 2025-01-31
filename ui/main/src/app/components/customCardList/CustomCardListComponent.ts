/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AsyncPipe, NgIf} from '@angular/common';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {CardComponent} from 'app/components/card/card.component';
import {AgGridAngular} from 'ag-grid-angular';
import {AllCommunityModule, GridOptions, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {DateRangePickerConfig} from 'app/utils/DateRangePickerConfig';
import {ExcelExport} from 'app/utils/excel-export';
import {CustomCardListView} from 'app/views/customCardList/CustomCardListView';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {Observable, ReplaySubject, take} from 'rxjs';
import {ResponsesCellRendererComponent} from './cellRenderers/ResponsesCellRendererComponent';

@Component({
    selector: 'of-custom-screen',
    templateUrl: './CustomCardListComponent.html',
    styleUrls: ['./CustomCardListComponent.scss'],
    standalone: true,
    imports: [
        TranslateModule,
        NgIf,
        AgGridAngular,
        AsyncPipe,
        FormsModule,
        NgxDaterangepickerMd,
        ReactiveFormsModule,
        NgbPagination,
        CardComponent
    ]
})
export class CustomScreenComponent implements OnInit, OnDestroy {
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;

    customScreenId: string;
    customCardListView: CustomCardListView;
    isCustomScreenDefinitionExist: boolean;
    gridOptions: GridOptions;
    gridApi: any;
    page = 1;
    private rowData = [];
    rowData$: Observable<any>;
    private readonly rowDataSubject = new ReplaySubject(1);
    dateRangePickerCustomRanges: any = {};
    dateRangePickerLocale: any = {};
    headerForm: FormGroup;
    modalRef: NgbModalRef;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly fb: FormBuilder,
        private readonly modalService: NgbModal
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});
        this.dateRangePickerLocale = DateRangePickerConfig.getLocale();
        this.dateRangePickerCustomRanges = DateRangePickerConfig.getCustomRanges();
        this.headerForm = this.fb.group({
            businessDateRangesForm: []
        });
    }

    ngOnInit(): void {
        this.route.paramMap.pipe(take(1)).subscribe((params) => {
            this.customScreenId = params.get('id');
            this.customCardListView = new CustomCardListView(this.customScreenId);

            const severityCellClassRules = {
                'opfab-sev-alarm': (field) => field.value === 'ALARM',
                'opfab-sev-action': (field) => field.value === 'ACTION',
                'opfab-sev-compliant': (field) => field.value === 'COMPLIANT',
                'opfab-sev-information': (field) => field.value === 'INFORMATION'
            };

            const typeOfStateCellClassRules = {
                'opfab-type-of-state-INPROGRESS': (field) => field.value === 'IN PROGRESS',
                'opfab-type-of-state-FINISHED': (field) => field.value === 'FINISHED',
                'opfab-type-of-state-CANCELED': (field) => field.value === 'CANCELED'
            };
            this.isCustomScreenDefinitionExist = this.customCardListView.isCustomScreenDefinitionExist();
            this.gridOptions = {
                domLayout: 'autoHeight',
                components: {
                    responsesCellRenderer: ResponsesCellRendererComponent
                },

                defaultColDef: {
                    editable: false
                },
                getLocaleText: function (params) {
                    // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                    // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                    return TranslationService.getTranslation('ag-grid.' + params.key);
                },

                columnTypes: {
                    default: {
                        sortable: true,
                        filter: true,
                        resizable: false,
                        wrapText: false
                    },
                    severity: {
                        sortable: false,
                        resizable: false,
                        maxWidth: 18,
                        cellClassRules: severityCellClassRules,
                        headerClass: 'opfab-ag-header-with-no-padding'
                    },
                    typeOfState: {
                        sortable: true,
                        filter: true,
                        resizable: false,
                        wrapText: false,
                        cellClassRules: typeOfStateCellClassRules
                    },
                    responses: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        wrapText: false,
                        cellRenderer: 'responsesCellRenderer'
                    }
                },
                ensureDomOrder: true, // rearrange row-index of rows when sorting cards (used for cypress)
                pagination: true,
                suppressCellFocus: true,
                suppressPaginationPanel: true,
                suppressHorizontalScroll: true,
                columnDefs: this.customCardListView.getColumnsDefinitionForAgGrid(),
                headerHeight: 70,
                rowHeight: 45,
                paginationPageSize: 10
            };
            this.rowData$ = this.rowDataSubject.asObservable();
            this.rowDataSubject.next(this.rowData); // needed to have an empty table if no data on component init
            this.customCardListView.getResults().subscribe((results) => {
                this.rowData = results;
                this.rowDataSubject.next(this.rowData);
            });
            this.headerForm.get('businessDateRangesForm').setValue({
                startDate: new Date(this.customCardListView.getBusinessPeriod().startDate),
                endDate: new Date(this.customCardListView.getBusinessPeriod().endDate)
            });
        });
    }
    onGridReady(params: any) {
        this.gridApi = params.api;
    }

    updateResultPage(currentPage: number): void {
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    resetForm() {
        //TODO
    }

    sendQuery() {
        const businessDates = this.headerForm.get('businessDateRangesForm').value;
        const startDate = Date.parse(businessDates.startDate?.toISOString());
        const endDate = Date.parse(businessDates.endDate?.toISOString());
        this.customCardListView.setBusinessPeriod(startDate, endDate);
    }

    selectCard(info: string) {
        SelectedCardService.setSelectedCardId(info);
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }

    export(): void {
        ExcelExport.exportJsonToExcelFile(this.customCardListView.getDataForExport(), 'Custom');
    }

    ngOnDestroy() {
        this.customCardListView.destroy();
    }
}
