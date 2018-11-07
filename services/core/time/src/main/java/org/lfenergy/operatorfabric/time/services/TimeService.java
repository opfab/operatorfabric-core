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

/**
 * Business time management
 */
@Service
@Slf4j
public class TimeService {

    private final RabbitTemplate rabbitTemplate;
    private final SimulatedTime simulatedTime;
    private final ObjectMapper mapper;
    private final FanoutExchange timeExchange;
    @Value("${time.default:#{null}}")
    private Long defaultStartTime;

    /**
     * Constructor by injection
     *
     * @param simulatedTime injected
     * @param rabbitTemplate injected
     * @param mapper injected
     * @param timeExchange injected
     */
    @Autowired
    public TimeService(SimulatedTime simulatedTime, RabbitTemplate rabbitTemplate, ObjectMapper mapper,
                       FanoutExchange timeExchange) {

        this.simulatedTime = simulatedTime;
        this.rabbitTemplate = rabbitTemplate;
        this.mapper = mapper;
        this.timeExchange = timeExchange;
        if(defaultStartTime!=null)
            updateTime(Instant.ofEpochMilli(defaultStartTime));
    }

    /**
     *
     * @return simuleted "now" time
     */
    public Instant computeNow() {
        return simulatedTime.computeNow();
    }

    /**
     * <p>Sets current time to specified value computing a delta in real and vertual value for later computation</p>
     * <p>Relies on {@link #updateTime(Instant, boolean)} with notify set to true</p>
     *
     * @param instant the new current time
     */
    public void updateTime(Instant instant) {
        updateTime(instant, true);
    }
    /**
     * <p>Sets current time to specified value computing a delta in real and vertual value for later computation</p>
     *
     * @param instant the new current time
     * @param notify if sets to true, an amqp message is sent
     */
    private void updateTime(Instant instant, boolean notify) {
        simulatedTime.setStartSimulatedTime(instant);
        simulatedTime.setReferenceSystemTime(Instant.now());
        if (notify) {
            notifyChanges();
        }
    }

    /**
     * Resets {@link SimulatedTime instance to initial values}
     */
    public void reset() {
        simulatedTime.reset();
        if(defaultStartTime!=null)
            updateTime(Instant.ofEpochMilli(defaultStartTime));
        else
            notifyChanges();
    }

    /**
     * <p>Updates speed value, used in later computation</p>
     * <p>Relies on {@link #updateSpeed(SpeedEnum, boolean)} with notify set to true</p>
     * @param speed
     */
    public void updateSpeed(SpeedEnum speed) {
        updateSpeed(speed, true);
    }

    /**
     * <p>Updates speed value, used in later computation</p>
     * @param speed the new speed value
     * @param notify if sets to true, an amqp message is sent
     */
    private void updateSpeed(SpeedEnum speed, boolean notify) {
        if (simulatedTime.getStartSimulatedTime() == null) {
            simulatedTime.setReferenceSystemTime(Instant.now());
            simulatedTime.setStartSimulatedTime(simulatedTime.getReferenceSystemTime());
        } else {
            updateTime(computeNow(), false);
        }
        simulatedTime.setSpeed(speed.coef);
        if (notify) {
            notifyChanges();
        }
    }

    /**
     * <p>Updates speed and time values, used in later computation</p>
     * <p>Trigers AMQP message emission</p>
     * @param speed
     */
    public void updateSpeedAndTime(SpeedEnum speed, Instant instant) {
        updateSpeed(speed, false);
        updateTime(instant);
    }


    /**
     * Send message containing current time configuration in JSON representation to timeExchange
     */
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

    /**
     * @return current speed configuration
     */
    public SpeedEnum retrieveSpeed() {
        return SpeedEnum.fromCoef(simulatedTime.getSpeed());
    }

    /**
     * @return complete configuration data
     */
    public TimeData fetchTimeData() {
        return new ServerTimeData(
           simulatedTime.getReferenceSystemTime()==null?null:simulatedTime.getReferenceSystemTime().toEpochMilli(),
           simulatedTime.getStartSimulatedTime()==null?null:simulatedTime.getStartSimulatedTime().toEpochMilli(),
           computeNow().toEpochMilli(),
           retrieveSpeed());
    }
}
