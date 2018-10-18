/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.model;

import lombok.NoArgsConstructor;

/**
 * <p></p>
 * Created on 19/06/18
 *
 * @author davibind
 */
@NoArgsConstructor
public class ServerTimeData extends ClientTimeData implements TimeData {
    public ServerTimeData(Long referenceTime, Long currentTime, Long computedNow, SpeedEnum speed) {
        super(referenceTime, currentTime, computedNow, speed);
    }
}
