/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {SoundServer} from 'app/business/server/sound.server';
import {PlatformLocation} from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AngularSoundServer implements SoundServer {
    private soundFileBasePath: string;

    constructor(private platformLocation: PlatformLocation) {
        const baseHref = this.platformLocation.getBaseHrefFromDOM();
        this.soundFileBasePath = (baseHref ? baseHref : '/') + 'assets/sounds/';
    }

    getSound(name: string): HTMLAudioElement {
        return new Audio(this.soundFileBasePath + name);
    }
}
