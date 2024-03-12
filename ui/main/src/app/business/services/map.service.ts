/* Copyright (c) 2022, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {EventEmitter} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';

export class MapService {
    static highlightCardEvent = new EventEmitter<any>();
    static zoomToLocationEvent = new EventEmitter<string>();

    static highlightOnMap(highLight: boolean, lightCard: LightCard) {
        const lightCardId = lightCard.id;
        this.highlightCardEvent.emit({lightCardId, highLight});
    }

    static zoomToLocation(lightCard: LightCard) {
        this.zoomToLocationEvent.emit(lightCard.id);
    }
}
