/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AdminComponent } from './admin.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdminRoutingModule } from './admin-rooting.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppErrorHandler } from 'app/common/error/app-error-handler';
import { OfUsersTableComponent } from './components/ngtable/users/ofuserstable.component';
import { OfGroupsTableComponent } from './components/ngtable/groups/of-groups-table/of-groups-table.component';
import { OfEntitiesTableComponent } from './components/ngtable/entities/of-entities-table/of-entities-table.component';
import { OfTableComponent } from './components/ngtable/oftable/oftable.component';
import { Ng2TableModule } from 'ng2-table';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AdminComponent,
    OfUsersTableComponent,
    OfGroupsTableComponent,
    OfEntitiesTableComponent,
    OfTableComponent
  ],
  imports: [
    FormsModule
    , ReactiveFormsModule
    , AdminRoutingModule
    , PaginationModule.forRoot()
    , CommonModule
    , TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    , Ng2TableModule
  ],
  providers: [ { provide: ErrorHandler, useClass: AppErrorHandler }]
})
export class AdminModule { }

