/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.time.controllers;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.lfenergy.operatorfabric.time.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
public class TimeController implements TimeApi {

    public static final int TIME_TO_SUBSTRACT_IN_FWD_BWD = 300000;
    public static final String CARD_RESPONSE_MSG = "Card service responded %d: %s";
    public static final String NO_CARD = "No card found";
    public static final String CARD_UNEXPECTED_ERROR_MSG = "Unexpected error from card service";
    public static final String CARD_UNAVAILABLE_MSG = "Unable to reach card service";
    private final CardConsultationServiceProxy cardConsultationServiceProxy;
    private final TimeService timeService;

    /**
     * Controller expects {@link TimeService} bean injection through Spring
     *
     * @param timeService the business time service
     */
    @Autowired
    public TimeController(TimeService timeService,
                          CardConsultationServiceProxy cardConsultationServiceProxy) {
        this.timeService = timeService;
        this.cardConsultationServiceProxy = cardConsultationServiceProxy;
    }

    @Override
    public Void resetTime(HttpServletRequest request, HttpServletResponse response) {
        timeService.reset();
        return null;
    }

    @Override
    public Void fetchNextTime(HttpServletRequest request, HttpServletResponse response, BigDecimal millisTime) throws Exception {
        long longMillisTime = millisTime.longValue();
        return fetchNextTime0(longMillisTime);
    }

    private Void fetchNextTime0(long longMillisTime) {
        try {
            Card card = this.cardConsultationServiceProxy.fetchNextCard(longMillisTime);
            timeService.updateTime(Instant.ofEpochMilli(card.getStartDate()).minusMillis(TIME_TO_SUBSTRACT_IN_FWD_BWD));
        } catch (FeignException fex) {
            handleCardServiceErrors(fex);
        }
        return null;
    }

    @Override
    public Void fetchPreviousTime(HttpServletRequest request, HttpServletResponse response, BigDecimal millisTime) throws Exception {
        long longMillisTime = millisTime.longValue();
        return fetchPreviousTime0(longMillisTime);
    }

    private Void fetchPreviousTime0(long longMillisTime) {
        try {
            Card card = this.cardConsultationServiceProxy.fetchPreviousCard(longMillisTime);
            timeService.updateTime(Instant.ofEpochMilli(card.getStartDate()).minusMillis(TIME_TO_SUBSTRACT_IN_FWD_BWD));
        } catch (FeignException fex) {
            return handleCardServiceErrors(fex);
        }
        return null;
    }

    @Override
    public Void fetchNextTimeFromNow(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return fetchNextTime0(timeService.computeNow().toEpochMilli());
    }

    @Override
    public Void fetchPreviousTimeFromNow(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return fetchPreviousTime0(timeService.computeNow().toEpochMilli());
    }

    private Void handleCardServiceErrors(FeignException fex) {
        if(fex.status() == 404) {
            log.info(String.format(CARD_RESPONSE_MSG,
                    404,
                    NO_CARD)
                    , fex);
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.GONE)
                    .message(NO_CARD).build());
        }else{
                log.error(CARD_UNEXPECTED_ERROR_MSG, fex);
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .message(CARD_UNAVAILABLE_MSG).build());
        }
    }

    @Override
    public TimeData fetchTime(HttpServletRequest request, HttpServletResponse response) {
        return timeService.fetchTimeData();
    }

    @Override
    public TimeData setTime(HttpServletRequest request, HttpServletResponse response, TimeData time) {
        User user = extractPrincipalFromContext();
        if (user == null) {
            log.info("Time updated by unknown user");
        } else {
            log.info("Time updated by " + user.getLogin());
        }
        if (time.getSpeed() != null && time.getVirtualTime() != null)
            timeService.updateSpeedAndTime(time.getSpeed(), time.getVirtualTime());
        else if (time.getSpeed() != null)
            setCurrentSpeed(request, response, time.getSpeed());
        else if (time.getVirtualTime() != null)
            setVirtualTime(request, response, time.getVirtualTime());
        return fetchTime(request,response);
    }

    private User extractPrincipalFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            return null;
        return (User) authentication.getPrincipal();
    }

    @Override
    public TimeData updateTime(HttpServletRequest request, HttpServletResponse response, TimeData time) {
        return setTime(request, response, time);
    }

    @Override
    public SpeedEnum setCurrentSpeed(HttpServletRequest request, HttpServletResponse response, SpeedEnum currentSpeed) {
        this.timeService.updateSpeed(currentSpeed);
        return this.timeService.retrieveSpeed();
    }

    @Override
    public Instant setVirtualTime(HttpServletRequest request, HttpServletResponse response, Instant virtualTime) {
            this.timeService.updateTime(virtualTime);
            return this.timeService.computeNow();
    }

    @Override
    public Instant updateVirtualTime(HttpServletRequest request, HttpServletResponse response, Instant virtualTime) {
        return setVirtualTime(request, response, virtualTime);
    }

    @Override
    public SpeedEnum updateCurrentSpeed(HttpServletRequest request, HttpServletResponse response, SpeedEnum currentSpeed) {
        return setCurrentSpeed(request, response, currentSpeed);
    }


}
