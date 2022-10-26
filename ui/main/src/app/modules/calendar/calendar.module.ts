/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {FullCalendarModule} from '@fullcalendar/angular';
import {CardModule} from '../card/card.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';

FullCalendarModule.registerPlugins([dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrapPlugin]);

@NgModule({
    declarations: [CalendarComponent],
    imports: [CommonModule, FullCalendarModule, CardModule, NgbModule]
})
export class CalendarModule {}
