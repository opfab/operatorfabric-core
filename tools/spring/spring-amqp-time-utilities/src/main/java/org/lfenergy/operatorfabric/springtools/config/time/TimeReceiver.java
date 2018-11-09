/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.time;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.lfenergy.operatorfabric.time.model.ClientTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

import java.io.IOException;
import java.time.Instant;

/**
 * Receives message from time queue and updates the local {@link SimulatedTime instance}
 *
 * @author David Binder
 */
public class TimeReceiver {


    private final ObjectMapper mapper;

    SimulatedTime simulatedTime = SimulatedTime.getInstance();


    public TimeReceiver(ObjectMapper mapper){
        this.mapper = mapper;
    }

    /**
     * {@link RabbitListener}, receives messages and update local {@link SimulatedTime} instance
     * @param stringMessage received string message
     * @throws IOException error during json de linearization
     */
    @RabbitListener(queues = "#{timeQueue.name}")
    public void receive(String stringMessage) throws IOException {
        ClientTimeData data = mapper.readValue(stringMessage,ClientTimeData.class);
        setSpeedAndTime(data.getSpeed(),Instant.ofEpochMilli(data.getCurrentTime()));
    }

    /**
     * Update local {@link SimulatedTime} instance
     * @param speed speed value
     * @param instant current time
     */
    private void setSpeedAndTime(SpeedEnum speed, Instant instant) {
        setTime(instant);
        setSpeed(speed);
    }

    /**
     * Update local {@link SimulatedTime} instance time
     * @param instant current time
     */
    private void setTime(Instant instant) {
        simulatedTime.setStartSimulatedTime(instant);
        simulatedTime.setReferenceSystemTime(Instant.now());
    }

    /**
     * Update local {@link SimulatedTime} instance speed
     * @param speed speed value
     */
    private void setSpeed(SpeedEnum speed) {
        if (simulatedTime.getStartSimulatedTime() == null) {
            simulatedTime.setReferenceSystemTime(Instant.now());
            simulatedTime.setStartSimulatedTime(simulatedTime.getReferenceSystemTime());
        } else {
            setTime(simulatedTime.computeNow());
        }
        simulatedTime.setSpeed(speed.coef);
    }

}
