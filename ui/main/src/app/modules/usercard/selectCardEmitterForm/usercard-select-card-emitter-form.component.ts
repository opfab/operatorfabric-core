/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';


@Component({
    selector: 'of-usercard-select-card-emitter-form',
    templateUrl: './usercard-select-card-emitter-form.component.html'
})
export class UsercardSelectCardEmitterFormComponent implements OnInit {

    @Input() public userEntitiesAllowedToSendCardOptions;
    @Input() public initialPublisher;

    selectCardEmitterForm: FormGroup;

    constructor() {
        // No body because all members are Inputs.
    }

    ngOnInit() {
        this.selectCardEmitterForm = new FormGroup({
            cardEmitter: new FormControl('')
        });
        this.selectCardEmitterForm.get('cardEmitter').setValue(this.initialPublisher);
    }

    public getSelectedCardEmitter() {
        return this.selectCardEmitterForm.value['cardEmitter'];
    }
}
