/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TryToLogIn} from '@ofActions/authentication.actions';
import {RouterGo} from 'ngrx-router';
import {AppState} from '@ofStore/index';

@Component({
    selector: 'app-log-in-form',
    providers: [],
    templateUrl: './login.component.html',
    styles: ['.button-row button {margin-right: 8px;}']
})
export class LoginComponent implements OnInit {

    hide: boolean;
    userForm: FormGroup;
    /* istanbul ignore next */
    constructor(private router: Router, private store: Store<AppState>) {}

    ngOnInit() {
        this.hide = true;
        this.userForm = new FormGroup({
                identifier: new FormControl(''),
                password: new FormControl('')
            }
        );
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            const username = this.userForm.get('identifier').value;
            const password = this.userForm.get('password').value;
            this.store.dispatch(new TryToLogIn({username: username, password: password}));
            this.store.dispatch(new RouterGo({path: ['/feed']}));
        }
    }

    resetForm(): void {
        this.userForm.reset();
    }

}
