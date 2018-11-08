/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.controllers;

import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.Instant;

/**
 * The Time Api exposing method to manipulate time
 *
 * @author David Binder
 */
@RestController
@RequestMapping("time")
@Slf4j
public class TimeController {

    private TimeService timeService;

    /**
     * Controller expects {@link TimeService} bean injection through Spring
     * @param timeService the business time service
     */
    @Autowired
    public TimeController(TimeService timeService) {
        this.timeService = timeService;
    }

    /**
     * resets time to original values (no delta in tie computation and normal speed)
     * @return nothing
     */
    @DeleteMapping
    public Void resetTime() {
        timeService.reset();
        return null;
    }

    /**
     * <p>fetch current time configuration</p>
     * @return time data
     */
    @GetMapping(produces = {"application/json"})
    @ResponseBody
    public TimeData fetchTime() {
        return timeService.fetchTimeData();
    }

    /**
     * <p>sets current time configuration</p>
     * @param user authorized user business principal object
     * @param time time data payload
     * @return
     */
    @PostMapping(consumes = {"application/json"})
    public TimeData setTime(@AuthenticationPrincipal User user, @ApiParam(value = "Time Data to update time " +
            "service") @Valid
    @RequestBody TimeData
            time) {
        if (user == null) {
            log.info("Time updated by unknown user");
        } else {
            log.info("Time updated by " + user.getLogin());
        }
        if (time.getSpeed() != null && time.getCurrentTime() != null)
            timeService.updateSpeedAndTime(time.getSpeed(), DateTimeUtil.toInstant(time.getCurrentTime()));
        else if (time.getSpeed() != null)
            setCurrentSpeed(time.getSpeed());
        else if (time.getCurrentTime() != null)
            setCurrentTime(time.getCurrentTime());
        return fetchTime();
    }

    /**
     * <p>sets current time configuration</p>
     * @param user authorized user business principal object
     * @param time time data payload
     * @return
     */
    @PutMapping
    public TimeData updateTime(@AuthenticationPrincipal User user, @ApiParam(value = "Time Data to update " +
            "time service")
    @Valid @RequestBody TimeData time) {
        return setTime(user, time);
    }

    /**
     * Sets the virtual server speed
     * @param currentSpeed one the speed preset
     * @return
     */
    @PostMapping(value = "/speed")
    public SpeedEnum setCurrentSpeed(@Valid @RequestBody SpeedEnum currentSpeed) {
        this.timeService.updateSpeed(currentSpeed);
        return this.timeService.retrieveSpeed();
    }

    /**
     * Sets the virtual server time (milliseconds since Epoch)
     * @param currentTime current time in milliseconds
     * @return
     */
    @PostMapping(value = "/current")
    public Long setCurrentTime(@Valid @RequestBody java.lang.Long currentTime) {
        this.timeService.updateTime(Instant.ofEpochMilli(currentTime));
        return this.timeService.computeNow().toEpochMilli();
    }

    /**
     * Sets the virtual server time (milliseconds since Epoch)
     * @param currentTime current time in milliseconds
     * @return
     */
    @PutMapping(value = "/current")
    public Long updateCurrentTime(@Valid @RequestBody java.lang.Long currentTime) {
        return setCurrentTime(currentTime);
    }

    /**
     * Sets the virtual server speed
     * @param currentSpeed one the speed preset
     * @return
     */
    @PutMapping(value = "/speed")
    public SpeedEnum updateCurrentspeed(@Valid @RequestBody SpeedEnum currentSpeed) {
        return setCurrentSpeed(currentSpeed);
    }
}
