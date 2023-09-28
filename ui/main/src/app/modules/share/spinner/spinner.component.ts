/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'of-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {
    @Input() loadingText = "shared.loadingInProgress";
    @Input() timeBeforeDisplayingSpinner = 500;
    @Input() seeInModal = false;

    @ViewChild('spinnerInModal') spinnerInModalPopupRef: TemplateRef<any>;
    private modalRef: NgbModalRef;
    private destroy = false;

    mustDisplaySpinner = false;

    constructor(private modalService: NgbModal) {}

    ngOnInit() {
        setTimeout(() => {
            this.mustDisplaySpinner = true;

            if (this.seeInModal) {
                if (! this.destroy) {
                    this.modalRef = this.openInModal();
                }
            }
        }, this.timeBeforeDisplayingSpinner);
    }

    private openInModal(): NgbModalRef {
        const modalOptions: NgbModalOptions = {
            centered: true,
            backdrop: 'static', // Modal shouldn't close even if we click outside it
            size: 'sm'
        };
        return this.modalService.open(this.spinnerInModalPopupRef, modalOptions);
    }

    ngOnDestroy() {
        this.destroy = true;
        if (this.modalRef) {
            this.modalRef.close();
        }
    }
}
