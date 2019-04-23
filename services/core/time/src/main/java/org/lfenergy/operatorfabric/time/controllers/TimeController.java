/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.time.services.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * The Time Api exposing method to manipulate time, documented at {@link TimeApi}
 *
 * @author David Binder
 */
@RestController
@RequestMapping("time")
@Slf4j
public class TimeController implements TimeApi{

    public static final int TIME_TO_SUBSTRACT_IN_FWD_BWD = 300000;
    private final CardConsultationServiceProxy cardConsultationServiceProxy;
    private final TimeService timeService;

    /**
     * Controller expects {@link TimeService} bean injection through Spring
     * @param timeService the business time service
     */
    @Autowired
    public TimeController(TimeService timeService,
                          CardConsultationServiceProxy cardConsultationServiceProxy) {
        this.timeService = timeService;
        this.cardConsultationServiceProxy = cardConsultationServiceProxy;
    }

    @Override
    public Void resetTime() {
        timeService.reset();
        return null;
    }

    @Override
    public Void fetchNextTime(BigDecimal millisTime) throws Exception {
        Card card = this.cardConsultationServiceProxy.fetchNextCard(millisTime.longValue());
        timeService.updateTime(Instant.ofEpochMilli(card.getStartDate()).minusMillis(TIME_TO_SUBSTRACT_IN_FWD_BWD));
        return null;
    }

    @Override
    public Void fetchPreviousTime(BigDecimal millisTime) throws Exception {
        Card card = this.cardConsultationServiceProxy.fetchPreviousCard(millisTime.longValue());
        timeService.updateTime(Instant.ofEpochMilli(card.getStartDate()).minusMillis(TIME_TO_SUBSTRACT_IN_FWD_BWD));
        return null;
    }

    @Override
    public TimeData fetchTime() {
        return timeService.fetchTimeData();
    }

    @Override
    public TimeData setTime( TimeData time) {
        User user = extractPrincipalFromContext();
        if (user == null) {
            log.info("Time updated by unknown user");
        } else {
            log.info("Time updated by " + user.getLogin());
        }
        if (time.getSpeed() != null && time.getVirtualTime() != null)
            timeService.updateSpeedAndTime(time.getSpeed(), DateTimeUtil.toInstant(time.getVirtualTime()));
        else if (time.getSpeed() != null)
            setCurrentSpeed(time.getSpeed());
        else if (time.getVirtualTime() != null)
            setVirtualTime(time.getVirtualTime());
        return fetchTime();
    }

    private User extractPrincipalFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
            return null;
        return (User) authentication.getPrincipal();
    }

    @Override
    public TimeData updateTime(TimeData time) {
        return setTime(time);
    }

    @Override
    public SpeedEnum setCurrentSpeed(SpeedEnum currentSpeed) {
        this.timeService.updateSpeed(currentSpeed);
        return this.timeService.retrieveSpeed();
    }

    @Override
    public Long setVirtualTime(java.lang.Long virtualTime) {
        this.timeService.updateTime(Instant.ofEpochMilli(virtualTime));
        return this.timeService.computeNow().toEpochMilli();
    }

    @Override
    public Long updateVirtualTime(java.lang.Long virtualTime) {
        return setVirtualTime(virtualTime);
    }

    @Override
    public SpeedEnum updateCurrentSpeed(SpeedEnum currentSpeed) {
        return setCurrentSpeed(currentSpeed);
    }


}
