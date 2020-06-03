

import {Injectable} from '@angular/core';
import {PlatformLocation} from "@angular/common";
import {LightCard, Severity} from "@ofModel/light-card.model";
import {from} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {selectFilteredFeed} from "@ofSelectors/feed.selectors";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {buildConfigSelector} from "@ofSelectors/config.selectors";

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

  constructor(private store: Store<AppState>, private platformLocation: PlatformLocation) {
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

  handleCards(lightCards : LightCard[], currentlyVisibleIds : string[]) {
    from(lightCards).subscribe( //There is no need to unsubscribe because this is by essence a finite observable
        // TODO Possible improvement: all cards in an operation have the same publishDate (to be checked) so we could do this check only once by operation and either handle all cards or dismiss the batch entirely
        (card : LightCard) => {
          if (((new Date().getTime() - card.publishDate)<=this.recentThreshold)&&(currentlyVisibleIds.includes(card.id))) {
            //Check whether card has just been published and whether it is currently visible in the feed
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
        }
    );

  }

  /* There is no need to limit the frequency of calls to playXXXX methods because if a given sound XXXX is already
  * playing when XXXX.play() is called, nothing happens.
  * */

  playSound(sound : HTMLAudioElement) {
    sound.play().catch(error => {
      /* istanbul ignore next */
      console.log("Notification sound wasn't played because the user hasn't interacted with the app yet (autoplay policy).");
      /* This is to handle the exception thrown due to the autoplay policy on Chrome. See https://goo.gl/xX8pDD */
    });
  }

}
