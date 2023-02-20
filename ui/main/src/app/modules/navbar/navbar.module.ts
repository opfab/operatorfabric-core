/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {NavbarComponent} from './navbar.component';
import {CustomLogoComponent} from './custom-logo/custom-logo.component';
import {IconComponent} from './icon/icon.component';
import {InfoComponent} from './info/info.component';
import {MenuLinkComponent} from './menus/menu-link/menu-link.component';
import {AppRoutingModule} from 'app/app-routing.module';
import {UserCardModule} from '../usercard/usercard.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AboutComponent} from '../core/about/about.component';
import {SpinnerModule} from "../share/spinner/spinner.module";

@NgModule({
    declarations: [
        NavbarComponent,
        CustomLogoComponent,
        IconComponent,
        InfoComponent,
        AboutComponent,
        MenuLinkComponent
    ],
    imports: [CommonModule, TranslateModule, AppRoutingModule, UserCardModule, NgbModule, SpinnerModule],
    exports: [NavbarComponent]
})
export class NavbarModule {}
