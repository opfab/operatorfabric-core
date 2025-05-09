/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {CardComponent} from 'app/components/card/CardComponent';
import {AgGridAngular} from 'ag-grid-angular';
import {
    AllCommunityModule,
    CellClickedEvent,
    ITooltipParams,
    ModuleRegistry,
    provideGlobalGridOptions,
    RowSelectionOptions
} from 'ag-grid-community';
import {DateRangePickerConfig} from 'app/utils/DateRangePickerConfig';
import {ExcelExport} from 'app/utils/ExcelExport';
import {CustomCardListView} from 'app/views/customCardList/CustomCardListView';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {Subject, takeUntil} from 'rxjs';
import {ResponsesCellRendererComponent} from './cellRenderers/ResponsesCellRendererComponent';
import {MultiSelectOption} from '../share/multi-select/model/MultiSelect';
import {MultiSelectComponent} from '../share/multi-select/multi-select.component';
import {HeaderFilter} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {ReadAndAckEnum, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {HasResponseCellRendererComponent} from './cellRenderers/HasResponseCellRendererComponent';
import {InputCellRendererComponent} from './cellRenderers/InputCellRendererComponent';
import {AgGrid} from 'app/utils/AgGrid';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {debounceTime} from 'rxjs/operators';
import {HTMLCellRendererComponent} from './cellRenderers/HTMLCellRendererComponent';
import {FilterValues} from 'app/views/customCardList/FilterValues';
import {CustomTooltipComponent} from './CustomToolTipComponent';
import {SelectCellRendererComponent} from './cellRenderers/SelectCellRendererComponent';
import {AcknowledgmentCellRendererComponent} from './cellRenderers/AcknowledgmentCellRendererComponent';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';

@Component({
    selector: 'of-custom-card-list-screen',
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
        MultiSelectComponent,
        NgbPopover
    ]
})
export class CustomCardListComponent implements OnInit, OnDestroy {
    @Input() customScreenId: string;
    customCardListView: CustomCardListView;
    isCustomScreenDefinitionExist: boolean;

    // Header form configuration
    headerForm = new FormGroup({
        businessDateRanges: new FormControl({}),
        processes: new FormControl([]),
        typeOfState: new FormControl([]),
        readAndAck: new FormControl([]),
        responseFromMyEntities: new FormControl(true),
        responseFromAllEntities: new FormControl(true)
    });

    // Date range picker configuration
    dateRangePickerCustomRanges: any = {};
    dateRangePickerLocale: any = {};
    initialStartDate: number;
    initialEndDate: number;

    // Process multi-select configuration
    processFilterVisible = false;
    processMultiSelectOptions: Array<MultiSelectOption> = [];
    processSelected: Array<string> = [];
    processMultiSelectConfig = {
        labelKey: 'shared.filters.process',
        placeholderKey: 'shared.filters.selectProcessText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    // Type of state multi-select configuration
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

    // Read and Ack multi-select configuration
    readAndAckSelected: Array<string> = [];
    readAndAckFilterVisible = true;
    readAndAckMultiSelectConfig = {
        labelKey: 'shared.readAndAck.readAndAck',
        placeholderKey: 'shared.filters.selectReadAndAckText',
        sortOptions: false,
        nbOfDisplayValues: 1
    };
    readAndAckMultiSelectOptions: Array<MultiSelectOption> = [
        new MultiSelectOption(
            ReadAndAckEnum.ACKNOWLEDGED,
            TranslationService.getTranslation('shared.readAndAck.ACKNOWLEDGED')
        ),
        new MultiSelectOption(
            ReadAndAckEnum.NOT_ACKNOWLEDGED,
            TranslationService.getTranslation('shared.readAndAck.NOT_ACKNOWLEDGED')
        ),
        new MultiSelectOption(ReadAndAckEnum.READ, TranslationService.getTranslation('shared.readAndAck.READ')),
        new MultiSelectOption(ReadAndAckEnum.NOT_READ, TranslationService.getTranslation('shared.readAndAck.NOT_READ'))
    ];

    // Ag-grid configuration
    gridOptions: any;
    gridApi: any;
    rowData = [];
    rowSelection: RowSelectionOptions;

    // Card detail modal configuration
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    modalRef: NgbModalRef;

    // Pagination configuration
    page = 1;
    pageSize: number = 10;
    readonly paginationPageSizeOptions = [10, 20, 50, 100];

    responseFromMyEntitiesFilterVisible = false;
    responseFromAllEntitiesFilterVisible = false;

    // Buttons configuration
    responseButtons = [];
    isAcknowledgmentButtonVisible: boolean;
    responseButtonDisabled = true;
    ackButtonDisabled = true;

    private readonly ngUnsubscribe$ = new Subject<void>();
    private inputMode$ = new Subject<void>();
    loadingInProgress = false;

    constructor(private readonly modalService: NgbModal) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});
        this.dateRangePickerLocale = DateRangePickerConfig.getLocale();
        this.dateRangePickerCustomRanges = DateRangePickerConfig.getCustomRanges();
    }

    ngOnInit(): void {
        this.customCardListView = new CustomCardListView(this.customScreenId);
        this.isCustomScreenDefinitionExist = this.customCardListView.isCustomScreenDefinitionExist();
        this.initialStartDate = this.customCardListView.getBusinessPeriod().startDate;
        this.initialEndDate = this.customCardListView.getBusinessPeriod().endDate;

        const savedPageSize = UserPreferencesService.getPreference('opfab.customScreens.page.size');
        if (savedPageSize) this.pageSize = parseInt(savedPageSize);
        this.listenForLoadingInProcess();
        this.setFiltersVisibility();
        this.setInitialBusinessPeriod();
        this.setButtonsConfiguration();
        this.setProcessFilter();
        this.setAgridConfiguration();
        this.startListeningToResults();

        this.headerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
            this.sendQuery();
        });
    }

    private listenForLoadingInProcess() {
        OpfabEventStreamService.getLoadingInProgress()
            .pipe(takeUntil(this.ngUnsubscribe$), debounceTime(500))
            .subscribe((loadingInProgress: boolean) => {
                this.loadingInProgress = loadingInProgress;
            });
    }

    private setFiltersVisibility() {
        this.processFilterVisible = this.customCardListView.isFilterVisibleInHeader(HeaderFilter.PROCESS);
        this.typeOfStateFilterVisible = this.customCardListView.isFilterVisibleInHeader(HeaderFilter.TYPE_OF_STATE);
        this.readAndAckFilterVisible = this.customCardListView.isFilterVisibleInHeader(HeaderFilter.READ_ACK);
        this.responseFromMyEntitiesFilterVisible = this.customCardListView.isFilterVisibleInHeader(
            HeaderFilter.RESPONSE_FROM_MY_ENTITIES
        );
        this.responseFromAllEntitiesFilterVisible = this.customCardListView.isFilterVisibleInHeader(
            HeaderFilter.RESPONSE_FROM_ALL_ENTITIES
        );
    }

    private setInitialBusinessPeriod() {
        this.headerForm.get('businessDateRanges').setValue({
            startDate: new Date(this.initialStartDate),
            endDate: new Date(this.initialEndDate)
        });
    }

    private setButtonsConfiguration() {
        this.isAcknowledgmentButtonVisible = this.customCardListView.isAcknowledgmentButtonVisible();
        this.responseButtons = this.customCardListView.getResponseButtons();
        if (this.responseButtons.length > 0 || this.customCardListView.isAcknowledgmentButtonVisible()) {
            this.rowSelection = {
                mode: 'multiRow',
                selectAll: 'currentPage',
                hideDisabledCheckboxes: true,
                isRowSelectable: (node) => {
                    return this.isRowSelectableForResponse(node) || this.isRowSelectableForAcknowledgment(node);
                }
            };
        }
    }

    private setAgridConfiguration() {
        const severityCellClassRules = {
            'opfab-sev-alarm': (field) => field.value === 'ALARM',
            'opfab-sev-action': (field) => field.value === 'ACTION',
            'opfab-sev-compliant': (field) => field.value === 'COMPLIANT',
            'opfab-sev-information': (field) => field.value === 'INFORMATION'
        };

        this.gridOptions = {
            ...AgGrid.getDefaultGridOptions(),
            components: {
                responsesCellRenderer: ResponsesCellRendererComponent,
                hasResponseCellRenderer: HasResponseCellRendererComponent,
                acknowledgmentCellRenderer: AcknowledgmentCellRendererComponent,
                inputCellRenderer: InputCellRendererComponent,
                htmlCellRenderer: HTMLCellRendererComponent,
                selectCellRenderer: SelectCellRendererComponent
            },

            defaultColDef: {
                editable: false,
                wrapHeaderText: true
            },
            columnTypes: {
                default: {
                    sortable: true,
                    filter: true,
                    resizable: false,
                    wrapText: false
                },
                html: {
                    sortable: true,
                    filter: true,
                    resizable: false,
                    wrapText: false,
                    cellRenderer: 'htmlCellRenderer',
                    filterValueGetter: (params: any) => {
                        return params.data[params.column.colId]?.rowValue ?? '';
                    },
                    comparator: (valueA: any, valueB: any) => {
                        const rowValueA = valueA.rowValue ?? '';
                        const rowValueB = valueB.rowValue ?? '';
                        if (rowValueA < rowValueB) {
                            return -1;
                        }
                        if (rowValueA > rowValueB) {
                            return 1;
                        }
                        return 0;
                    }
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
                    cellStyle: (params) => {
                        return {
                            color: 'var(--opfab-color-' + params.value.color + ')'
                        };
                    },
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

                // The cell should show a circle with the color defined in the field color
                // and the numerical value defined in the field numericalValue is used for sorting and filtering
                // the use of agNumberColumnFilter is necessary to be able to filter the numerical value
                // using for example the range filter
                coloredCircle: {
                    sortable: true,
                    filter: 'agNumberColumnFilter',
                    resizable: false,
                    wrapText: false,
                    cellStyle: {display: 'flex', 'justify-content': 'center'},
                    cellRenderer: (params: any) => {
                        return (
                            '<div style="margin-top:10px;width: 20px; height: 20px;border-radius: 50%;background-color:' +
                            params.value?.color +
                            '"></div>'
                        );
                    },
                    comparator: (valueA: any, valueB: any) => {
                        if (valueA.numericalValue < valueB.numericalValue) {
                            return -1;
                        }
                        if (valueA.numericalValue > valueB.numericalValue) {
                            return 1;
                        }
                        return 0;
                    },
                    filterValueGetter: (params: any) => {
                        return params.data[params.column.colId].numericalValue;
                    }
                },
                responseFromMyEntities: {
                    sortable: false,
                    filter: false,
                    resizable: false,
                    width: 15,
                    wrapText: false,
                    cellRenderer: 'hasResponseCellRenderer'
                },
                acknowledgment: {
                    sortable: false,
                    filter: false,
                    resizable: false,
                    width: 15,
                    wrapText: false,
                    cellRenderer: 'acknowledgmentCellRenderer'
                },
                input: {
                    cellRenderer: 'inputCellRenderer',
                    sortable: false,
                    filter: false,
                    resizable: false
                },
                select: {
                    cellRenderer: 'selectCellRenderer',
                    sortable: false,
                    filter: false,
                    resizable: false
                }
            },
            columnDefs: this.getColumnDefs(),
            paginationPageSize: this.pageSize,
            suppressHorizontalScroll: false,
            domLayout: 'normal',
            suppressColumnVirtualisation: true, // This is necessary to avoid the input field to disappear when scrolling horizontally (see issue #8187)
            tooltipShowDelay: 1000,
            tooltipHideDelay: 2000,
            tooltipComponent: CustomTooltipComponent,
            onRowSelected: (event) => this.onRowSelected(event)
        };
    }

    private setProcessFilter(): void {
        if (this.processFilterVisible) {
            this.headerForm.get('processes').setValue([]);
            this.customCardListView.getAllProcessesListAvailableForUser().forEach((process) => {
                this.processMultiSelectOptions.push(new MultiSelectOption(process.id, process.label));
            });
        }
    }

    private getColumnDefs() {
        return this.customCardListView.getColumnsDefinitionForAgGrid().map((columnDef) => {
            if (columnDef.customParams.showTooltips) {
                columnDef.tooltipComponent = CustomTooltipComponent;
                columnDef.tooltipValueGetter = (params: ITooltipParams) => {
                    return params.value;
                };
            }
            return columnDef;
        });
    }
    private isRowSelectableForResponse(node: any): boolean {
        if (this.responseButtons?.length > 0) return node.data.isResponsePossible;
        return false;
    }

    private isRowSelectableForAcknowledgment(node: any): boolean {
        if (this.customCardListView.isAcknowledgmentButtonVisible()) return node.data.isAcknowledgmentPossible;
        return false;
    }

    onGridReady(params: any) {
        this.gridApi = params.api;

        this.gridApi.addEventListener('selectionChanged', () => {
            const userHasSelectedRows = this.gridApi.getSelectedRows().length > 0;

            // If a row is selected, the user is editing the selection, so we stop listening to results
            if (userHasSelectedRows) {
                this.stopListeningToResults();
            } else {
                this.startListeningToResults();
            }
        });
    }

    updateResultPage(currentPage: number): void {
        if (this.page !== currentPage) this.gridApi.deselectAll();
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    startListeningToResults() {
        this.inputMode$ = new Subject<void>();

        this.customCardListView
            .getResults()
            .pipe(takeUntil(this.inputMode$))
            .subscribe((results) => {
                this.rowData = results;
            });
    }

    stopListeningToResults() {
        this.inputMode$.next();
        this.inputMode$.complete();
    }

    resetForm() {
        this.gridApi.deselectAll();
        this.processSelected = [];
        this.typeOfStateSelected = [];
        this.readAndAckSelected = [];
        this.setInitialBusinessPeriod();
        this.gridApi.setFilterModel(null);
        this.sendQuery();
    }

    sendQuery() {
        const businessDates = this.headerForm.get('businessDateRanges').value as {startDate: Date; endDate: Date};
        const startDate = Date.parse(businessDates.startDate?.toISOString());
        const endDate = Date.parse(businessDates.endDate?.toISOString());
        const filterValues = new FilterValues();
        filterValues.startDate = startDate;
        filterValues.endDate = endDate;
        filterValues.processes = [...this.headerForm.get('processes').value];
        filterValues.typesOfStateFilter = [...this.headerForm.get('typeOfState').value];
        filterValues.readAndAckFilter = [...this.headerForm.get('readAndAck').value];
        filterValues.includeCardsWithResponseFromMyEntities = this.headerForm.get('responseFromMyEntities').value;
        filterValues.includeCardsWithResponsesFromAllEntities = this.headerForm.get('responseFromAllEntities').value;
        this.customCardListView.setFilters(filterValues);
        this.customCardListView.search();
    }

    selectCard(event: any) {
        if (this.isCheckboxColumnClicked(event)) {
            const node = event.node;
            node.setSelected(!node.isSelected());
            return;
        }
        SelectedCardService.setSelectedCardId(event.data.cardId);
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

    // Allows row selection by clicking the cell and not just the generated ag-checkbox
    private isCheckboxColumnClicked(event: CellClickedEvent): boolean {
        return event.column.getColId() === 'ag-Grid-SelectionColumn';
    }

    clickOnResponseButton(buttonId: string) {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            return;
        }
        this.customCardListView.clickOnButton(buttonId, this.getResponsesData()).then((success) => {
            if (success) this.gridApi.deselectAll();
        });
    }

    clickOnAcknowledgmentButton() {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            return;
        }
        this.customCardListView.clickOnAcknowledgmentButton(
            selectedRows.filter((row) => row.isAcknowledgmentPossible).map((row) => row.cardId)
        );
        this.gridApi.deselectAll();
    }

    private getResponsesData(): Map<string, any> {
        const responseData = new Map<string, any>();
        const selectedRowNodes = this.gridApi.getSelectedNodes();
        const inputColumns = this.getInputColumnIds();

        selectedRowNodes.forEach((rowNode: any) => {
            if (rowNode.data.isResponsePossible) {
                const userInputs = {};
                const inputCellRenderers = this.gridApi.getCellRendererInstances({
                    columns: inputColumns,
                    rowNodes: [rowNode]
                });
                if (inputCellRenderers.length > 0)
                    inputCellRenderers.forEach((cellRenderer: any) => {
                        userInputs[cellRenderer.params.colDef.field] = cellRenderer.getInputValue();
                    });
                responseData.set(rowNode.data.cardId, userInputs);
            }
        });
        return responseData;
    }

    private onRowSelected(event: any) {
        const selectedRow = event.node;
        const inputColumns = this.getInputColumnIds();
        if (inputColumns.length === 0) return;

        const param = {columns: inputColumns, rowNodes: [selectedRow]};
        const instances = this.gridApi.getCellRendererInstances(param);
        if (instances.length > 0)
            instances.forEach((element) => {
                if (event.node.data.isResponsePossible) {
                    if (event.node.isSelected()) element.activateInput();
                    else element.deactivateInput();
                }
            });
        this.setButtonStatus();
    }

    setButtonStatus() {
        const instances = this.gridApi.getSelectedNodes();
        let isResponseButtonEnabled = false;
        let isAckButtonEnabled = false;
        instances.forEach((node) => {
            if (node.data.isResponsePossible) isResponseButtonEnabled = true;
            if (node.data.isAcknowledgmentPossible) isAckButtonEnabled = true;
        });
        this.responseButtonDisabled = !isResponseButtonEnabled;
        this.ackButtonDisabled = !isAckButtonEnabled;
    }

    onPageSizeChanged(target: EventTarget | null) {
        // Cast to get rid of "Property 'value' does not exist on type 'HTMLElement'."
        const value = +(<HTMLSelectElement>target).value;
        this.gridApi.setGridOption('paginationPageSize', value);
        this.pageSize = value;
        this.gridApi.deselectAll();
        UserPreferencesService.setPreference('opfab.customScreens.page.size', this.pageSize);
    }

    private getInputColumnIds(): string[] {
        const allColumns = this.gridApi.getColumnDefs();
        const inputColumns = allColumns.filter((col) => col.type === 'input' || col.type === 'select');
        return inputColumns.map((col) => col.field);
    }

    export(): void {
        ExcelExport.exportJsonToExcelFile(this.customCardListView.getDataForExport(), 'Custom');
    }

    ngOnDestroy() {
        this.customCardListView.destroy();
        this.stopListeningToResults();
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
