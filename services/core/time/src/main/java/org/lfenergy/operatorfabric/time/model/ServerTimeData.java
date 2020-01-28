
package org.lfenergy.operatorfabric.time.model;

import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Time Model, documented at {@link TimeData}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@NoArgsConstructor
public class ServerTimeData extends ClientTimeData implements TimeData {
    public ServerTimeData(Instant referenceTime, Instant virtualTime, Instant computedNow, SpeedEnum speed) {
        super(referenceTime, virtualTime, computedNow, speed);
    }
}
