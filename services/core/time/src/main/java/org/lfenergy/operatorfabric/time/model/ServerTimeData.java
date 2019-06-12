/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
    public ServerTimeData(Long referenceTime, Long virtualTime, Long computedNow, SpeedEnum speed) {
        super(referenceTime, virtualTime, computedNow, speed);
    }
}
