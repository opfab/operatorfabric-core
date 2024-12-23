/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {filter} from 'rxjs/operators';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {AuthService} from 'app/authentication/auth.service';
import {NgClass, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-login',
    templateUrl: './login.component.html',
    styles: ['.btn-primary {margin-right: 8px;}'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgClass, TranslateModule, NgIf]
})
export class LoginComponent implements OnInit {
    userForm: FormGroup<{
        identifier: FormControl<string | null>;
        password: FormControl<string | null>;
    }>;
    loginMessage: Message;

    constructor(
        private readonly authService: AuthService,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.authService
            .getRejectLoginMessage()
            .pipe(filter((m) => m != null && m.level === MessageLevel.ERROR))
            .subscribe((m) => {
                this.loginMessage = m;
                this.changeDetector.markForCheck();
            });
        this.userForm = new FormGroup({
            identifier: new FormControl(''),
            password: new FormControl('')
        });
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            const username = this.userForm.get('identifier').value.trim();
            const password = this.userForm.get('password').value;
            this.authService.tryToLogin(username, password);
        }
    }

    resetForm(): void {
        this.userForm.reset();
    }
}
