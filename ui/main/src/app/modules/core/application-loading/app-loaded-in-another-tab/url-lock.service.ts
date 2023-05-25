/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})


export class UrlLockService {
    private readonly IS_OPFAB_URL_CURRENTLY_USED_KEY = 'isOpfabUrlCurrentlyUsed';
    private readonly DISCONNECTED_BY_NEW_USER_USING_SAME_URL = 'disconnectedByNewUserUsingSameUrl';
    private readonly store = localStorage;
    private disconnectSignalListener:Function ; 

    public lockUrl(): void {
        this.store.setItem(this.IS_OPFAB_URL_CURRENTLY_USED_KEY, 'true');
    }

    public unlockUrl(): void {
        this.store.setItem(this.IS_OPFAB_URL_CURRENTLY_USED_KEY, 'false');
    }

    public isUrlLocked(): boolean {
        const urlLock = this.store.getItem(this.IS_OPFAB_URL_CURRENTLY_USED_KEY);
        return  urlLock ? JSON.parse(urlLock) : false;
    }

    public disconnectOtherUsers() : void {
        this.store.setItem(this.DISCONNECTED_BY_NEW_USER_USING_SAME_URL, JSON.stringify(new Date().getTime()));
    }

    public setDisconnectSignalListener(listener: Function) : void {
        this.disconnectSignalListener = listener;
        window.addEventListener('storage', this.listenForDisconnectSignal.bind(this), false);
    }

    private listenForDisconnectSignal(event) : void {
        if (this.isEventADisconnectionSignal(event))  this.disconnectSignalListener();
    }

    private isEventADisconnectionSignal(event):boolean {
        return event.storageArea == this.store && event.key == this.DISCONNECTED_BY_NEW_USER_USING_SAME_URL;
    }
}
