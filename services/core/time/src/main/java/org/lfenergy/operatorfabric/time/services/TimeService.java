/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.time.model.ServerTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.utilities.VirtualTime;
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
    private final VirtualTime virtualTime;
    private final ObjectMapper mapper;
    private final FanoutExchange timeExchange;
    @Value("${time.default:#{null}}")
    private Long defaultStartTime;

    /**
     * Constructor by injection
     *
     * @param virtualTime injected virtual time singleton instance
     * @param rabbitTemplate injected rabbit template for message sending
     * @param mapper injected object mapper to linearize object into json string representation in AMQP message body
     * @param timeExchange injected AMQP exchange to send time messages
     */
    @Autowired
    public TimeService(VirtualTime virtualTime, RabbitTemplate rabbitTemplate, ObjectMapper mapper,
                       FanoutExchange timeExchange) {

        this.virtualTime = virtualTime;
        this.rabbitTemplate = rabbitTemplate;
        this.mapper = mapper;
        this.timeExchange = timeExchange;
        if(defaultStartTime!=null)
            updateTime(Instant.ofEpochMilli(defaultStartTime));
    }

    /**
     *
     * @return virtual "now" time
     */
    public Instant computeNow() {
        return virtualTime.computeNow();
    }

    /**
     * <p>Sets current time to specified value computing a delta in real and virtual value for later computation</p>
     * <p>Relies on {@link #updateTime(Instant, boolean)} with notify set to true</p>
     *
     * @param instant the new current time
     */
    public void updateTime(Instant instant) {
        updateTime(instant, true);
    }
    /**
     * <p>Sets current time to specified value computing a delta in real and virtual value for later computation</p>
     *
     * @param instant the new current time
     * @param notify if sets to true, an amqp message is sent
     */
    private void updateTime(Instant instant, boolean notify) {
        virtualTime.setStartVirtualTime(instant);
        virtualTime.setReferenceSystemTime(Instant.now());
        if (notify) {
            notifyChanges();
        }
    }

    /**
     * Resets {@link VirtualTime instance to initial values}
     */
    public void reset() {
        virtualTime.reset();
        if(defaultStartTime!=null)
            updateTime(Instant.ofEpochMilli(defaultStartTime));
        else
            notifyChanges();
    }

    /**
     * <p>Updates speed value, used in later computation</p>
     * <p>Relies on {@link #updateSpeed(SpeedEnum, boolean)} with notify set to true</p>
     * @param speed new speed value
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
        if (virtualTime.getStartVirtualTime() == null) {
            virtualTime.setReferenceSystemTime(Instant.now());
            virtualTime.setStartVirtualTime(virtualTime.getReferenceSystemTime());
        } else {
            updateTime(computeNow(), false);
        }
        virtualTime.setSpeed(speed.coef);
        if (notify) {
            notifyChanges();
        }
    }

    /**
     * <p>Updates speed and time values, used in later computation</p>
     * <p>Trigers AMQP message emission</p>
     * @param speed new speed value
     * @param time new time value
     */
    public void updateSpeedAndTime(SpeedEnum speed, Instant time) {
        updateSpeed(speed, false);
        updateTime(time);
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
            log.error("Unable to send update time message due to Json processing error", e);
        } catch (AmqpException e){
            log.error("Unable to send update time message due to AMQP error", e);
        }
        virtualTime.notifyTimeWarp();
    }

    /**
     * @return current speed configuration
     */
    public SpeedEnum retrieveSpeed() {
        return SpeedEnum.fromCoef(virtualTime.getSpeed());
    }

    /**
     * @return complete configuration data
     */
    public TimeData fetchTimeData() {
        return new ServerTimeData(
           virtualTime.getReferenceSystemTime()==null?null: virtualTime.getReferenceSystemTime().toEpochMilli(),
           virtualTime.getStartVirtualTime()==null?null: virtualTime.getStartVirtualTime().toEpochMilli(),
           computeNow().toEpochMilli(),
           retrieveSpeed());
    }
}
