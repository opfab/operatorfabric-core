/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {PlatformLocation} from "@angular/common";
import {LightCard, Severity} from "@ofModel/light-card.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {LightCardsService} from './lightcards.service';
import {Subject} from "rxjs";

@Injectable()
export class SoundNotificationService {

    soundConfigBySeverity: Map<Severity,SoundConfig>;

    soundEnabled: Map<Severity,boolean>;

    recentThreshold: number = 2000;
    /* The subscription used by the front end to get cards to display in the feed from the backend doesn't distinguish
     * between old cards loaded from the database and new cards arriving through the notification broker.
     * In addition, the getCardOperation observable on which this sound notification is hooked will also emit events
     * every time the subscription changes (= every time the feed time filters are changed). So to only notify cards
     * once (and only new cards), sounds will only be played for a given card if the elapsed time since its publishDate
     * is below this threshold. */

    soundFileBasePath: string;

    incomingCardOrReminder = new Subject();

    constructor(private store: Store<AppState>, private platformLocation: PlatformLocation,private lightCardsService: LightCardsService) {

        this.soundConfigBySeverity = new Map<Severity, SoundConfig>();
        this.soundConfigBySeverity.set(Severity.ALARM, {soundFileName: 'alarm.mp3', soundEnabledSetting: 'playSoundForAlarm'});
        this.soundConfigBySeverity.set(Severity.ACTION, {soundFileName: 'action.mp3', soundEnabledSetting: 'playSoundForAction'});
        this.soundConfigBySeverity.set(Severity.COMPLIANT, {soundFileName: 'compliant.mp3', soundEnabledSetting: 'playSoundForCompliant'});
        this.soundConfigBySeverity.set(Severity.INFORMATION, {soundFileName: 'information.mp3', soundEnabledSetting: 'playSoundForInformation'});

        let baseHref = platformLocation.getBaseHrefFromDOM();
        this.soundFileBasePath = (baseHref?baseHref:'/')+'assets/sounds/'

        this.soundEnabled = new Map<Severity, boolean>();
        this.soundConfigBySeverity.forEach((soundConfig,severity) => {
            store.select(buildSettingsOrConfigSelector(soundConfig.soundEnabledSetting)).subscribe(x => { this.soundEnabled.set(severity,x)});
        })

        this.incomingCardOrReminder.subscribe((card : LightCard) => {
            this.playSoundForCard(card);
        })

    }

    //TODO Unsubscribe on destroy
    handleRemindCard(card: LightCard ) {
        if(this.lightCardsService.isCardVisibleInFeed(card)) this.incomingCardOrReminder.next(card);
    }

    handleLoadedCard(card: LightCard) {
        if(this.lightCardsService.isCardVisibleInFeed(card) && this.checkCardIsRecent(card)) this.incomingCardOrReminder.next(card);
    }

    checkCardIsRecent (card: LightCard) : boolean {
        return ((new Date().getTime() - card.publishDate) <= this.recentThreshold);
    }

    private getSoundForSeverity(severity: Severity) : HTMLAudioElement {
        return new Audio(this.soundFileBasePath+this.soundConfigBySeverity.get(severity).soundFileName);
    }

    playSoundForCard(card: LightCard) {

        if(this.soundEnabled.get(card.severity)) {
            this.playSound(this.getSoundForSeverity(card.severity));
        } else {
            console.debug("No sound was played for "+card.id+" as sound is disabled for this severity");
        }
    }

    /* There is no need to limit the frequency of calls to playXXXX methods because if a given sound XXXX is already
    * playing when XXXX.play() is called, nothing happens.
    * */

    playSound(sound: HTMLAudioElement) {
        sound.play().catch(error => {
            console.log(new Date().toISOString(),
                `Notification sound wasn't played because the user hasn't interacted with the app yet (autoplay policy).`);
            /* This is to handle the exception thrown due to the autoplay policy on Chrome. See https://goo.gl/xX8pDD */
        });
    }

}

export class SoundConfig {

    soundFileName: string;
    soundEnabledSetting:string;

}
