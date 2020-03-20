/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';

import { SoundNotificationService } from './sound-notification.service';
import {StoreModule} from "@ngrx/store";
import {appReducer,} from "@ofStore/index";
import {getOneRandomLightCard} from "@tests/helpers";
import {Severity} from "@ofModel/light-card.model";

describe('SoundNotificationService', () => {

  let service : SoundNotificationService;
  let playSound;

  function configAllSeveritiesOn() {
    service.playSoundForAlarm = true;
    service.playSoundForAction = true;
    service.playSoundForCompliant = true;
    service.playSoundForInformation = true;
  }


  function configOnlyActionOn() {
    service.playSoundForAlarm = false;
    service.playSoundForAction = true;
    service.playSoundForCompliant = false;
    service.playSoundForInformation = false;
  }

  function configAllSeveritiesOff() {
    service.playSoundForAlarm = false;
    service.playSoundForAction = false;
    service.playSoundForCompliant = false;
    service.playSoundForInformation = false;
  }

  function noConfig() {
    service.playSoundForAlarm = undefined;
    service.playSoundForAction = undefined;
    service.playSoundForCompliant = undefined;
    service.playSoundForInformation = undefined;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(appReducer)],
      providers: [SoundNotificationService
      ]
    });
    service = TestBed.get(SoundNotificationService);
    playSound = spyOn(service, 'playSound').and.callThrough();
  });

  it('should be created', () => {
    const service: SoundNotificationService = TestBed.get(SoundNotificationService);
    expect(service).toBeTruthy();
  });

  it('should play appropriate sound only if card is visible and freshly published and its severity is on', () => {

    //Handles 1 Action and 1 Information, should play 1 Action sound

    configOnlyActionOn();

    const today = new Date().getTime();
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today}); //This one shouldn't be notified

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleCards([actionCard,informationCard],[actionCard.id,informationCard.id]);
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);

  });

  it('should play appropriate sound for all severities if card is visible and freshly published and all severities are on', () => {

    //Handles 1 card of each severity, should play all four sounds

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const alarmCard = getOneRandomLightCard({severity:Severity.ALARM, publishDate:today});
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const compliantCard = getOneRandomLightCard({severity:Severity.COMPLIANT, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today});

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleCards([alarmCard,actionCard,compliantCard,informationCard],[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    expect(playSound).toHaveBeenCalledTimes(4);
    expect(playSound).toHaveBeenCalledWith(service.alarmSound);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);
    expect(playSound).toHaveBeenCalledWith(service.compliantSound);
    expect(playSound).toHaveBeenCalledWith(service.informationSound);

  });

  it('should not play sound if all severities are off even if card is visible and freshly published', () => {

    configAllSeveritiesOff();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({publishDate:today});

    service.handleCards([card],[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should not play sound if no configuration is made even if card is visible and freshly published', () => {

    noConfig();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleCards([card],[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  /* For these tests, settings configuration property to true for all severities */

  it('should not play sound if card is not visible (even if freshly published)', () => {

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleCards([card],[]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should not play sound if card is not freshly published (even if visible)', () => {

    configAllSeveritiesOn()

    const past = new Date().getTime() - service.recentThreshold * 10; //PublishDate that is way past the recent threshold
    const card = getOneRandomLightCard({ publishDate: past});

    service.handleCards([card],[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });


});
