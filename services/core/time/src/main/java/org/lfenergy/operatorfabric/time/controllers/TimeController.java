/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

@RestController
@RequestMapping("time")
@Slf4j
public class TimeController  {

    private TimeService timeService;

    @Autowired
    public TimeController(TimeService timeService) {
        this.timeService = timeService;
    }

    @DeleteMapping
    public Void resetTime() {
        timeService.reset();
        return null;
    }

    @GetMapping(produces = { "application/json" })
    @ResponseBody
    //@PreAuthorize("#oauth2.isClient()")
    public TimeData fetchTime() {
        return timeService.fetchTimeData();
    }

    @PostMapping(consumes = { "application/json" })
    public TimeData setTime(@AuthenticationPrincipal User user, @ApiParam(value = "Time Data to update time " +
       "service"  )  @Valid
                                @RequestBody TimeData
                            time) {
        if(user ==null){
            log.info("Time updated by unknown user");
        }else{
            log.info("Time updated by "+user.getLogin());
        }
        if(time.getSpeed()!=null && time.getCurrentTime()!=null)
            timeService.setSpeedAndTime(time.getSpeed(),DateTimeUtil.toInstant(time.getCurrentTime()));
        else if(time.getSpeed()!=null)
            setCurrentSpeed(time.getSpeed());
        else if(time.getCurrentTime()!=null)
            setCurrentTime(time.getCurrentTime());
        return fetchTime();
    }

    @PutMapping
    //@PreAuthorize("#oauth2.hasScope('write')")
    public TimeData updateTime(@AuthenticationPrincipal User user, @ApiParam(value = "Time Data to update " +
       "time service"  )
    @Valid @RequestBody TimeData time) {
        return setTime(user, time);
    }

    @PostMapping(value = "/speed")
    public SpeedEnum setCurrentSpeed(@Valid @RequestBody SpeedEnum currentspeed) {
        this.timeService.setSpeed(currentspeed);
        return this.timeService.getSpeed();
    }

    @PostMapping(value = "/current")
    public Long setCurrentTime(@Valid @RequestBody java.lang.Long currentTime) {
        this.timeService.setTime(Instant.ofEpochMilli(currentTime));
        return this.timeService.computeNow().toEpochMilli();
    }

    @PutMapping(value = "/current")
    public Long updateCurrentTime(@Valid @RequestBody java.lang.Long currentTime) {
        return setCurrentTime(currentTime);
    }

    @PutMapping(value = "/speed")
    public SpeedEnum updateCurrentspeed(@Valid @RequestBody SpeedEnum currentspeed) {
        return setCurrentSpeed(currentspeed);
    }
}
