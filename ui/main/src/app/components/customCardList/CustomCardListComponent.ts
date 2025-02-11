/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {CardComponent} from 'app/components/card/card.component';
import {AgGridAngular} from 'ag-grid-angular';
import {
    AllCommunityModule,
    GridOptions,
    ModuleRegistry,
    provideGlobalGridOptions,
    RowSelectionOptions
} from 'ag-grid-community';
import {DateRangePickerConfig} from 'app/utils/DateRangePickerConfig';
import {ExcelExport} from 'app/utils/excel-export';
import {CustomCardListView} from 'app/views/customCardList/CustomCardListView';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {Observable, ReplaySubject, Subject, take, takeUntil} from 'rxjs';
import {ResponsesCellRendererComponent} from './cellRenderers/ResponsesCellRendererComponent';
import {MultiSelectOption} from '../share/multi-select/model/MultiSelect';
import {MultiSelectComponent} from '../share/multi-select/multi-select.component';
import {HeaderFilter} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {HasResponseCellRendererComponent} from './cellRenderers/HasResponseCellRendererComponent';

@Component({
    selector: 'of-custom-screen',
    templateUrl: './CustomCardListComponent.html',
    styleUrls: ['./CustomCardListComponent.scss'],
    standalone: true,
    imports: [
        TranslateModule,
        NgIf,
        NgFor,
        AgGridAngular,
        AsyncPipe,
        FormsModule,
        NgxDaterangepickerMd,
        ReactiveFormsModule,
        NgbPagination,
        CardComponent,
        MultiSelectComponent
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
    headerForm = new FormGroup({
        businessDateRanges: new FormControl({}),
        processes: new FormControl([]),
        typeOfState: new FormControl([]),
        responseFromMyEntities: new FormControl(true),
        responseFromAllEntities: new FormControl(true)
    });
    modalRef: NgbModalRef;

    processFilterVisible = false;
    processMultiSelectOptions: Array<MultiSelectOption> = [];
    processSelected: Array<string> = [];
    processMultiSelectConfig = {
        labelKey: 'shared.filters.process',
        placeholderKey: 'shared.filters.selectProcessText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    typeOfStateFilterVisible = false;
    typeOfStateMultiSelectOptions: Array<MultiSelectOption> = [
        new MultiSelectOption(
            TypeOfStateEnum.INPROGRESS,
            TranslationService.getTranslation('shared.typeOfState.INPROGRESS')
        ),
        new MultiSelectOption(
            TypeOfStateEnum.FINISHED,
            TranslationService.getTranslation('shared.typeOfState.FINISHED')
        ),
        new MultiSelectOption(
            TypeOfStateEnum.CANCELED,
            TranslationService.getTranslation('shared.typeOfState.CANCELED')
        )
    ];
    typeOfStateSelected: Array<string> = [];
    typeOfStateMultiSelectConfig = {
        labelKey: 'shared.typeOfState.typeOfState',
        placeholderKey: 'monitoring.filters.typeOfState.selectTypeOfStateText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    responseFromMyEntitiesFilterVisible = false;
    responseFromAllEntitiesFilterVisible = false;
    responseButtons = [];
    public rowSelection: RowSelectionOptions;

    private readonly ngUnsubscribe$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly modalService: NgbModal
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});
        this.dateRangePickerLocale = DateRangePickerConfig.getLocale();
        this.dateRangePickerCustomRanges = DateRangePickerConfig.getCustomRanges();
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
                'opfab-type-of-state-INPROGRESS': (field) => field.value.value === 'INPROGRESS',
                'opfab-type-of-state-FINISHED': (field) => field.value.value === 'FINISHED',
                'opfab-type-of-state-CANCELED': (field) => field.value.value === 'CANCELED'
            };
            this.isCustomScreenDefinitionExist = this.customCardListView.isCustomScreenDefinitionExist();
            this.processFilterVisible = this.customCardListView.isFilterVisibleInHeader(HeaderFilter.PROCESS);
            this.typeOfStateFilterVisible = this.customCardListView.isFilterVisibleInHeader(HeaderFilter.TYPE_OF_STATE);
            this.responseFromMyEntitiesFilterVisible = this.customCardListView.isFilterVisibleInHeader(
                HeaderFilter.RESPONSE_FROM_MY_ENTITIES
            );
            this.responseFromAllEntitiesFilterVisible = this.customCardListView.isFilterVisibleInHeader(
                HeaderFilter.RESPONSE_FROM_ALL_ENTITIES
            );
            this.responseButtons = this.customCardListView.getResponseButtons();
            if (this.responseButtons.length > 0) this.rowSelection = {mode: 'multiRow'};
            this.gridOptions = {
                domLayout: 'autoHeight',
                components: {
                    responsesCellRenderer: ResponsesCellRendererComponent,
                    hasResponseCellRenderer: HasResponseCellRendererComponent
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
                        resizable: false,
                        wrapText: false,
                        cellClassRules: typeOfStateCellClassRules,
                        cellRenderer: (params: any) => params.value.text,
                        comparator: (valueA: any, valueB: any) => {
                            if (valueA.text < valueB.text) {
                                return -1;
                            }
                            if (valueA.text > valueB.text) {
                                return 1;
                            }
                            return 0;
                        },
                        filter: true,
                        filterValueGetter: (params: any) => params.data.typeOfState.text
                    },
                    dateAndTime: {
                        sortable: true,
                        resizable: false,
                        wrapText: false,
                        cellRenderer: (params: any) => params.value.text,
                        comparator: (valueA: any, valueB: any) => {
                            if (valueA.value < valueB.value) {
                                return -1;
                            }
                            if (valueA.value > valueB.value) {
                                return 1;
                            }
                            return 0;
                        },
                        filter: true,
                        filterValueGetter: (params: any) => {
                            return params.data[params.column.colId].text;
                        }
                    },
                    responses: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        wrapText: false,
                        cellRenderer: 'responsesCellRenderer'
                    },
                    coloredCircle: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        wrapText: false,
                        cellStyle: {display: 'flex', 'justify-content': 'center', alignItems: 'center'},
                        cellRenderer: (params: any) => {
                            return (
                                '<div style="width: 20px; height: 20px;border-radius: 50%;background-color:' +
                                params.value +
                                '"></div>'
                            );
                        }
                    },
                    responseFromMyEntities: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        width: 15,
                        wrapText: false,
                        cellRenderer: 'hasResponseCellRenderer'
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
            if (this.responseButtons.length > 0) {
                this.rowSelection = {
                    mode: 'multiRow',
                    selectAll: 'currentPage',
                    hideDisabledCheckboxes: true,
                    isRowSelectable: (node) => {
                        return this.customCardListView.isResponsePossibleForCard(node.data.cardId);
                    }
                };
            }

            this.headerForm.get('businessDateRanges').setValue({
                startDate: new Date(this.customCardListView.getBusinessPeriod().startDate),
                endDate: new Date(this.customCardListView.getBusinessPeriod().endDate)
            });
            if (this.processFilterVisible) {
                this.headerForm.get('processes').setValue([]);
                this.initProcessFilter();
            }
        });
    }
    private initProcessFilter(): void {
        this.customCardListView.getProcessList().forEach((process) => {
            this.processMultiSelectOptions.push(new MultiSelectOption(process.id, process.label));
        });
        this.headerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.sendQuery();
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
        if (this.processFilterVisible) {
            this.processSelected = [];
            this.typeOfStateSelected = [];
            this.sendQuery();
        }
    }

    sendQuery() {
        const businessDates = this.headerForm.get('businessDateRanges').value as {startDate: Date; endDate: Date};
        const startDate = Date.parse(businessDates.startDate?.toISOString());
        const endDate = Date.parse(businessDates.endDate?.toISOString());
        this.customCardListView.setBusinessPeriod(startDate, endDate);
        this.customCardListView.setProcessList([...this.headerForm.get('processes').value]);
        this.customCardListView.setTypesOfStateFilter([...this.headerForm.get('typeOfState').value]);
        this.customCardListView.setResponseFromMyEntitiesChoice(this.headerForm.get('responseFromMyEntities').value);
        this.customCardListView.setResponseFromAllEntitiesChoice(this.headerForm.get('responseFromAllEntities').value);
        this.customCardListView.search();
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

    clickOnResponseButton(buttonId: string) {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            return;
        }
        const selectedCards = selectedRows.map((row) => row.cardId);
        this.customCardListView.clickOnButton(buttonId, selectedCards);
    }

    export(): void {
        ExcelExport.exportJsonToExcelFile(this.customCardListView.getDataForExport(), 'Custom');
    }

    ngOnDestroy() {
        this.customCardListView.destroy();
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
