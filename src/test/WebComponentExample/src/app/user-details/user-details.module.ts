/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, Injector, NgModule} from "@angular/core";
import {createCustomElement} from "@angular/elements";
import {BrowserModule} from "@angular/platform-browser";
import {UserDetailsComponent} from "./user-details.component";

@NgModule({
    declarations: [
      UserDetailsComponent
    ],
    imports: [
      BrowserModule
    ],
    exports: [UserDetailsComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })

  export class UserDetailsModule implements DoBootstrap{
    constructor(private injector: Injector) {
    }
    
    public ngDoBootstrap(): void {
        const userDetails = createCustomElement(UserDetailsComponent, {injector: this.injector});
        customElements.define('user-details', userDetails);
      }
   }

  