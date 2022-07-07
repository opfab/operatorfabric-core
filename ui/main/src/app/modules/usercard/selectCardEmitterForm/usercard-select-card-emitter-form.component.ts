/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {takeUntil, debounceTime, Subject} from 'rxjs';

@Component({
    selector: 'of-usercard-select-card-emitter-form',
    templateUrl: './usercard-select-card-emitter-form.component.html'
})
export class UsercardSelectCardEmitterFormComponent implements OnInit {
    @Input() public userEntitiesAllowedToSendCardOptions;
    @Input() public initialPublisher;

    @Output() public cardEmitterChange: EventEmitter<any> = new EventEmitter<any>();

    unsubscribe$: Subject<void> = new Subject<void>();

    selectCardEmitterForm: UntypedFormGroup;

    constructor() {
        // No body because all members are Inputs.
    }

    ngOnInit() {
        this.selectCardEmitterForm = new UntypedFormGroup({
            cardEmitter: new UntypedFormControl('')
        });

        this.selectCardEmitterForm.get('cardEmitter').setValue(this.initialPublisher);
        this.listenForEmitterChange();
    }

    public getSelectedCardEmitter() {
        return this.selectCardEmitterForm.value['cardEmitter'];
    }

    private listenForEmitterChange() {
        this.selectCardEmitterForm
            .get('cardEmitter')
            .valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(10))
            .subscribe((state) => {
                if (!!state) {
                    this.cardEmitterChange.emit({
                        emitter: this.selectCardEmitterForm.get('cardEmitter').value
                    });
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
