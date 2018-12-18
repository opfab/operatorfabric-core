import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {TryToLogIn} from "@ofStore/authentication/authentication.actions";
import {RouterGo} from "ngrx-router";
import {AppState} from "@ofStore/index";

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
