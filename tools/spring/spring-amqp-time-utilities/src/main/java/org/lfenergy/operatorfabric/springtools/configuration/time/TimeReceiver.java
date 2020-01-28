
package org.lfenergy.operatorfabric.springtools.configuration.time;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.lfenergy.operatorfabric.time.model.ClientTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.utilities.VirtualTime;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

import java.io.IOException;
import java.time.Instant;

/**
 * Receives message from time queue and updates the local {@link VirtualTime instance}
 *
 * @author David Binder
 */
public class TimeReceiver {


    private final ObjectMapper mapper;

    VirtualTime virtualTime = VirtualTime.getInstance();


    public TimeReceiver(ObjectMapper mapper){
        this.mapper = mapper;
    }

    /**
     * {@link RabbitListener}, receives messages and update local {@link VirtualTime} instance
     * @param stringMessage received string message
     * @throws IOException error during json de linearization
     */
    @RabbitListener(queues = "#{timeQueue.name}")
    public void receive(String stringMessage) throws IOException {
        ClientTimeData data = mapper.readValue(stringMessage,ClientTimeData.class);
        setSpeedAndTime(data.getSpeed(),data.getVirtualTime());
    }

    /**
     * Update local {@link VirtualTime} instance
     * @param speed speed value
     * @param instant current time
     */
    private void setSpeedAndTime(SpeedEnum speed, Instant instant) {
        setTime(instant);
        setSpeed(speed);
    }

    /**
     * Update local {@link VirtualTime} instance time
     * @param instant current time
     */
    private void setTime(Instant instant) {
        virtualTime.setStartVirtualTime(instant);
        virtualTime.setReferenceSystemTime(Instant.now());
    }

    /**
     * Update local {@link VirtualTime} instance speed
     * @param speed speed value
     */
    private void setSpeed(SpeedEnum speed) {
        if (virtualTime.getStartVirtualTime() == null) {
            virtualTime.setReferenceSystemTime(Instant.now());
            virtualTime.setStartVirtualTime(virtualTime.getReferenceSystemTime());
        } else {
            setTime(virtualTime.computeNow());
        }
        virtualTime.setSpeed(speed.coef);
    }

}
