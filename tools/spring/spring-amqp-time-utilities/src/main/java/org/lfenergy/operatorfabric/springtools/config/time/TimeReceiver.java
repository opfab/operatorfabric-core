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
 * <p></p>
 * Created on 29/06/18
 *
 * @author davibind
 */
public class TimeReceiver {


    private final ObjectMapper mapper;

    SimulatedTime simulatedTime = SimulatedTime.getInstance();


    public TimeReceiver(ObjectMapper mapper){
        this.mapper = mapper;
    }

    @RabbitListener(queues = "#{timeQueue.name}")
    public void receive1(String in) throws InterruptedException, IOException {
        ClientTimeData data = mapper.readValue(in,ClientTimeData.class);
        setSpeedAndTime(data.getSpeed(),Instant.ofEpochMilli(data.getCurrentTime()));
    }

    private void setSpeedAndTime(SpeedEnum speed, Instant instant) {
        setTime(instant);
        setSpeed(speed);
    }

    private void setTime(Instant instant) {
        simulatedTime.setStartSimulatedTime(instant);
        simulatedTime.setReferenceSystemTime(Instant.now());
    }

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
