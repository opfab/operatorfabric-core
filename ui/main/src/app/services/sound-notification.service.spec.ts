/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {TestBed} from '@angular/core/testing';

import { SoundNotificationService } from './sound-notification.service';
import {StoreModule} from "@ngrx/store";
import {appReducer,} from "@ofStore/index";
import {getOneRandomLightCard} from "@tests/helpers";
import {Severity} from "@ofModel/light-card.model";
import {UpdateTrigger} from "@ofActions/light-card.actions";

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
    service = TestBed.inject(SoundNotificationService);
    playSound = spyOn(service, 'playSound').and.callThrough();
  });

  it('should be created', () => {
    const service: SoundNotificationService = TestBed.inject(SoundNotificationService);
    expect(service).toBeTruthy();
  });

  // ---- Tests for loaded cards ----

  it('should play appropriate sound only if loaded card is visible and freshly published and its severity is on', () => {

    //Handles 1 Action and 1 Information, should play 1 Action sound

    configOnlyActionOn();

    const today = new Date().getTime();
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today}); //This one shouldn't be notified

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleLoadedCard(actionCard,[actionCard.id,informationCard.id]);
    service.handleLoadedCard(informationCard,[actionCard.id,informationCard.id]);
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);

  });

  it('should play appropriate sound for all severities if loaded card is visible and freshly published and all severities are on', () => {

    //Handles 1 card of each severity, should play all four sounds

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const alarmCard = getOneRandomLightCard({severity:Severity.ALARM, publishDate:today});
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const compliantCard = getOneRandomLightCard({severity:Severity.COMPLIANT, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today});

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleLoadedCard(alarmCard,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleLoadedCard(actionCard,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleLoadedCard(compliantCard,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleLoadedCard(informationCard,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
 
    expect(playSound).toHaveBeenCalledTimes(4);
    expect(playSound).toHaveBeenCalledWith(service.alarmSound);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);
    expect(playSound).toHaveBeenCalledWith(service.compliantSound);
    expect(playSound).toHaveBeenCalledWith(service.informationSound);

  });

  it('should not play sound if all severities are off even if loaded card is visible and freshly published', () => {

    configAllSeveritiesOff();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({publishDate:today});

    service.handleLoadedCard(card,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should not play sound if no configuration is made even if loaded card is visible and freshly published', () => {

    noConfig();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleLoadedCard(card,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  /* For these tests, settings configuration property to true for all severities */

  it('should not play sound if loaded card is not visible (even if freshly published)', () => {

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleLoadedCard(card,[]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should not play sound if loaded card is not freshly published (even if visible)', () => {

    configAllSeveritiesOn()

    const past = new Date().getTime() - service.recentThreshold * 10; //PublishDate that is way past the recent threshold
    const card = getOneRandomLightCard({ publishDate: past});

    service.handleLoadedCard(card,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  // ---- Tests for updated cards ----

  it('should play appropriate sound only if updated card is a reminder, is visible and its severity is on', () => {

    //Handles 1 Action and 1 Information, should play 1 Action sound

    configOnlyActionOn();

    const today = new Date().getTime();
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today}); //This one shouldn't be notified

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleUpdatedCard(actionCard,UpdateTrigger.REMINDER, [actionCard.id,informationCard.id]);
    service.handleUpdatedCard(informationCard,UpdateTrigger.REMINDER,[actionCard.id,informationCard.id]);
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);

  });

  it('should play appropriate sound for all severities if updated card is a reminder, is visible and all severities are on', () => {

    //Handles 1 card of each severity, should play all four sounds

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const alarmCard = getOneRandomLightCard({severity:Severity.ALARM, publishDate:today});
    const actionCard = getOneRandomLightCard({severity:Severity.ACTION, publishDate:today});
    const compliantCard = getOneRandomLightCard({severity:Severity.COMPLIANT, publishDate:today});
    const informationCard = getOneRandomLightCard({severity:Severity.INFORMATION, publishDate:today});

    expect(playSound).toHaveBeenCalledTimes(0);
    service.handleUpdatedCard(alarmCard,UpdateTrigger.REMINDER,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleUpdatedCard(actionCard,UpdateTrigger.REMINDER,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleUpdatedCard(compliantCard,UpdateTrigger.REMINDER,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);
    service.handleUpdatedCard(informationCard,UpdateTrigger.REMINDER,[alarmCard.id, actionCard.id, compliantCard.id, informationCard.id]);

    expect(playSound).toHaveBeenCalledTimes(4);
    expect(playSound).toHaveBeenCalledWith(service.alarmSound);
    expect(playSound).toHaveBeenCalledWith(service.actionSound);
    expect(playSound).toHaveBeenCalledWith(service.compliantSound);
    expect(playSound).toHaveBeenCalledWith(service.informationSound);

  });

  it('should not play sound if all severities are off even if updated card is a reminder and is visible', () => {

    configAllSeveritiesOff();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({publishDate:today});

    service.handleUpdatedCard(card,UpdateTrigger.REMINDER,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should not play sound if no configuration is made even if updated card is a reminder and is visible', () => {

    noConfig();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleUpdatedCard(card,UpdateTrigger.REMINDER,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

  /* For these tests, settings configuration property to true for all severities */

  it('should not play sound if updated card is not visible, even if it is reminder', () => {

    configAllSeveritiesOn();

    const today = new Date().getTime();
    const card = getOneRandomLightCard({ publishDate: today});

    service.handleUpdatedCard(card,UpdateTrigger.REMINDER,[]);
    expect(playSound).not.toHaveBeenCalled();

  });

  it('should play sound if updated card is reminder and is visible, even if it is not freshly published (', () => {

    configAllSeveritiesOn()

    const past = new Date().getTime() - service.recentThreshold * 10; //PublishDate that is way past the recent threshold
    const card = getOneRandomLightCard({ publishDate: past});

    service.handleUpdatedCard(card,UpdateTrigger.REMINDER,[card.id]);
    expect(playSound).toHaveBeenCalled();

  });

  it('should not play sound if updated card is not a reminder, even if it is visible (', () => {

    configAllSeveritiesOn()

    const past = new Date().getTime() - service.recentThreshold * 10; //PublishDate that is way past the recent threshold
    const card = getOneRandomLightCard({ publishDate: past});

    service.handleUpdatedCard(card,UpdateTrigger.ACKNOWLEDGEMENT,[card.id]);
    expect(playSound).not.toHaveBeenCalled();

  });

});
