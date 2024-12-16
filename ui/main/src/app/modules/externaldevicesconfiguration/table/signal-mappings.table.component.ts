/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {ExternalDevicesConfigurationDirective, Field, FieldType} from './externaldevicesconfiguration-directive';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {SignalMappingsModalComponent} from '../editModal/signal-mappings-modal.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/spinner.component';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-signal-mappings',
    templateUrl: './externaldevicesconfiguration-directive.html',
    styleUrls: ['../externaldevicesconfiguration.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, SpinnerComponent, AgGridAngular, NgbPagination]
})
export class SignalMappingsTableComponent extends ExternalDevicesConfigurationDirective {
    fields = [new Field('id'), new Field('supportedSignals', FieldType.SIGNAL_MAPPINGS)];
    i18NPrefix = 'externalDevicesConfiguration.signalMappings.';
    canAddItems = true;
    addItemLabel = 'externalDevicesConfiguration.input.addSignalMapping';
    addSignalMappingsModalComponent = SignalMappingsModalComponent;

    getRowHeight(): number {
        return 180;
    }

    queryData(): Observable<any[]> {
        return ExternalDevicesService.queryAllSignalMappings();
    }

    createNewItem() {
        const modalRef = this.modalService.open(this.addSignalMappingsModalComponent, this.modalOptions);
        modalRef.componentInstance.configurations = this.configurations;
        modalRef.result.then(
            // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
            // NGRX actions and effects for this sole purpose
            () => {
                // If modal is closed
                this.refreshData(); // This refreshes the data when the modal is closed after a change
            },
            () => {
                // If modal is dismissed (by clicking the "close" button, the top right cross icon
                // or clicking outside the modal, there is no need to refresh the data
            }
        );
    }
}
