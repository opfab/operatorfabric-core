/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.time.model.ServerTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

//TODO init time with forced value
@Service
@Slf4j
public class TimeService {

    private final RabbitTemplate rabbitTemplate;
    private final SimulatedTime simulatedTime;
    private final ObjectMapper mapper;
    private final FanoutExchange timeExchange;
    @Value("${time.default:#{null}}")
    private Long defaultStartTime;

    @Autowired
    public TimeService(SimulatedTime simulatedTime, RabbitTemplate rabbitTemplate, ObjectMapper mapper,
                       FanoutExchange timeExchange) {

        this.simulatedTime = simulatedTime;
        this.rabbitTemplate = rabbitTemplate;
        this.mapper = mapper;
        this.timeExchange = timeExchange;
        if(defaultStartTime!=null)
            setTime(Instant.ofEpochMilli(defaultStartTime));
    }

    public Instant computeNow() {
        return simulatedTime.computeNow();
    }

    public void setTime(Instant instant) {
        setTime(instant, true);
    }

    private void setTime(Instant instant, boolean notify) {
        simulatedTime.setStartSimulatedTime(instant);
        simulatedTime.setReferenceSystemTime(Instant.now());
        if (notify) {
            notifyChanges();
        }
    }

    public void reset() {
        simulatedTime.reset();
        notifyChanges();
    }

    public void setSpeed(SpeedEnum speed) {
        setSpeed(speed, true);
    }

    private void setSpeed(SpeedEnum speed, boolean notify) {
        if (simulatedTime.getStartSimulatedTime() == null) {
            simulatedTime.setReferenceSystemTime(Instant.now());
            simulatedTime.setStartSimulatedTime(simulatedTime.getReferenceSystemTime());
        } else {
            setTime(computeNow(), false);
        }
        simulatedTime.setSpeed(speed.coef);
        if (notify) {
            notifyChanges();
        }
    }

    public void setSpeedAndTime(SpeedEnum speed, Instant instant) {
        setTime(instant);
        setSpeed(speed, false);
    }


    private void notifyChanges() {
        try {
            rabbitTemplate.convertAndSend(timeExchange.getName(),
               "",
               mapper.writeValueAsString(fetchTimeData()));
            log.info("Time update sent");
        } catch (JsonProcessingException e) {
            log.error("Unable to send update time message due to linearisation process error", e);
        } catch (AmqpException e){
            log.error("Unable to send update time message due to AMQP error", e);
        }
        simulatedTime.notifyTimeWarp();
    }

    public SpeedEnum getSpeed() {
        return SpeedEnum.fromCoef(simulatedTime.getSpeed());
    }

    public TimeData fetchTimeData() {
        return new ServerTimeData(
           simulatedTime.getReferenceSystemTime()==null?null:simulatedTime.getReferenceSystemTime().toEpochMilli(),
           simulatedTime.getStartSimulatedTime()==null?null:simulatedTime.getStartSimulatedTime().toEpochMilli(),
           computeNow().toEpochMilli(),
           getSpeed());
    }
}
