/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Component} from "@angular/core";

@Component({
    selector: 'confirm-modal-component',
    templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
    constructor(public modal: NgbActiveModal) {
    }

    dismiss() {
        this.modal.dismiss(ThirdActionComporentModalReturn.DISMISS);
    }

    ok() {
        this.modal.close(ThirdActionComporentModalReturn.OK);
    }

    cancel() {
        this.modal.dismiss(ThirdActionComporentModalReturn.CANCEL);
    }
}

export enum ThirdActionComporentModalReturn {
    CANCEL, OK, DISMISS
}
