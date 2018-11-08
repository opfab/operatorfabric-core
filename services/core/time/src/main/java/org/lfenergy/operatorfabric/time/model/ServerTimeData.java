package org.lfenergy.operatorfabric.time.model;

import lombok.NoArgsConstructor;

/**
 * Time Model, documented at {@link TimeData}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@NoArgsConstructor
public class ServerTimeData extends ClientTimeData implements TimeData {
    public ServerTimeData(Long referenceTime, Long currentTime, Long computedNow, SpeedEnum speed) {
        super(referenceTime, currentTime, computedNow, speed);
    }
}
