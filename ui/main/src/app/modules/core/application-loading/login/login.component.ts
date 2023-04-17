/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {filter} from 'rxjs/operators';
import {Message, MessageLevel} from '@ofModel/message.model';
import {AuthService} from 'app/authentication/auth.service';

@Component({
    selector: 'of-login',
    templateUrl: './login.component.html',
    styles: ['.btn-primary {margin-right: 8px;}']
})
export class LoginComponent implements OnInit {
    userForm: FormGroup<{
        identifier: FormControl<string | null>;
        password: FormControl<string | null>;
    }>;
    loginMessage: Message;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.authService.getRejectLoginMessage()
            .pipe(filter((m) => m != null && m.level === MessageLevel.ERROR))
            .subscribe((m) => (this.loginMessage = m));
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
