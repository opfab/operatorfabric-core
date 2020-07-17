/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CalendarComponent} from './calendar.component';
import {FullCalendarModule } from '@fullcalendar/angular';
import {CardsModule} from '../cards/cards.module';
import {MatDialogModule } from '@angular/material/dialog';
import {FullscreenCardViewComponent} from './cardView/fullscreen-card-view.component';


@NgModule({
  declarations: [CalendarComponent, FullscreenCardViewComponent],
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule,
    CardsModule
  ],
  entryComponents: [
    FullscreenCardViewComponent,
  ]
})
export class CalendarModule { }
