/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FreeMessageComponent} from './free-message.component';
import {FreeMessageRoutingModule} from './free-message-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {FlatpickrModule} from 'angularx-flatpickr';
import {ArchivesModule} from '../archives/archives.module';
import {SingleFilterModule} from '../../components/share/single-filter/single-filter.module';
import {DatetimeFilterModule} from '../../components/share/datetime-filter/datetime-filter.module';
import {TextAreaModule} from '../../components/share/text-area/text-area.module';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {CardComponent} from '../cards/components/card/card.component';
import {CardsModule} from '../cards/cards.module';

@NgModule({
    declarations: [FreeMessageComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FreeMessageRoutingModule,
        TranslateModule,
        FlatpickrModule.forRoot(),
        ArchivesModule,
        SingleFilterModule,
        DatetimeFilterModule,
        NgbModalModule,
        TextAreaModule,
        CardsModule
    ]
})
export class FreeMessageModule {
}
