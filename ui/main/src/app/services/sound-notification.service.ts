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

@Injectable()
export class SoundNotificationService {

  alarmSoundPath:string;
  alarmSound:HTMLAudioElement;
  actionSoundPath:string;
  actionSound:HTMLAudioElement;
  compliantSoundPath:string;
  compliantSound:HTMLAudioElement;
  informationSoundPath:string;
  informationSound:HTMLAudioElement;

  playSoundForAlarm:boolean;
  playSoundForAction:boolean;
  playSoundForCompliant:boolean;
  playSoundForInformation:boolean;

  recentThreshold: number = 2000;
  /* The subscription used by the front end to get cards to display in the feed from the backend doesn't distinguish
   * between old cards loaded from the database and new cards arriving through the notification broker.
   * In addition, the getCardOperation observable on which this sound notification is hooked will also emit events
   * every time the subscription changes (= every time the feed time filters are changed). So to only notify cards
   * once (and only new cards), sounds will only be played for a given card if the elapsed time since its publishDate
   * is below this threshold. */

  constructor(private store: Store<AppState>, private platformLocation: PlatformLocation,private lightCardsService: LightCardsService) {
    let baseHref = platformLocation.getBaseHrefFromDOM();
    this.alarmSoundPath = (baseHref?baseHref:'/')+'assets/sounds/alarm.mp3'
    this.alarmSound = new Audio(this.alarmSoundPath);
    this.actionSoundPath = (baseHref?baseHref:'/')+'assets/sounds/action.mp3'
    this.actionSound = new Audio(this.actionSoundPath);
    this.compliantSoundPath = (baseHref?baseHref:'/')+'assets/sounds/compliant.mp3'
    this.compliantSound = new Audio(this.compliantSoundPath);
    this.informationSoundPath = (baseHref?baseHref:'/')+'assets/sounds/information.mp3'
    this.informationSound = new Audio(this.informationSoundPath);

    store.select(buildSettingsOrConfigSelector('playSoundForAlarm')).subscribe(x => { this.playSoundForAlarm = x;});
    store.select(buildSettingsOrConfigSelector('playSoundForAction')).subscribe(x => { this.playSoundForAction = x;});
    store.select(buildSettingsOrConfigSelector('playSoundForCompliant')).subscribe(x => { this.playSoundForCompliant = x;});
    store.select(buildSettingsOrConfigSelector('playSoundForInformation')).subscribe(x => { this.playSoundForInformation = x;});

  }

  handleRemindCard(card: LightCard ) {
    if(this.lightCardsService.isCardVisibleInFeed(card)) this.playSoundForCard(card);
  }

  handleLoadedCard(card: LightCard) {
    if(this.lightCardsService.isCardVisibleInFeed(card) && this.checkCardIsRecent(card)) this.playSoundForCard(card);
  }

  checkCardIsRecent (card: LightCard) : boolean {
    return ((new Date().getTime() - card.publishDate) <= this.recentThreshold);
  }

  playSoundForCard(card: LightCard) {

    switch (card.severity) {
      case Severity.ALARM:
        if(this.playSoundForAlarm) {
          this.playSound(this.alarmSound);
        }
        break;
      case Severity.ACTION:
        if(this.playSoundForAction) {
          this.playSound(this.actionSound);
        }
        break;
      case Severity.COMPLIANT:
        if(this.playSoundForCompliant) {
          this.playSound(this.compliantSound);
        }
        break;
      case Severity.INFORMATION:
        if(this.playSoundForInformation) {
          this.playSound(this.informationSound);
        }
        break;
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
