/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardOperationsComponent } from './card-operations.component';
import { CardOperationsListComponent } from './card-operations-list/card-operations-list.component';
import { CardOperationDetailsComponent } from './card-operation-details/card-operation-details.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CardOperationsComponent, CardOperationsListComponent, CardOperationDetailsComponent]
})
export class CardOperationsModule { }
