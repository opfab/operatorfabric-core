/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TryToLogIn} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {filter} from "rxjs/operators";
import {selectMessage} from "@ofSelectors/authentication.selectors";
import {Message, MessageLevel} from "@ofModel/message.model";


@Component({
    selector: 'of-login',
    templateUrl: './login.component.html',
    styles: ['.btn-primary {margin-right: 8px;}']
})
export class LoginComponent implements OnInit {

    userForm: FormGroup;
    loginMessage: Message;

    /* istanbul ignore next */
    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.store.select(selectMessage).pipe(filter(m => m != null && m.level === MessageLevel.ERROR))
            .subscribe(m => this.loginMessage = m);
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
        }
    }

    resetForm(): void {
        this.userForm.reset();
    }

}
