/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Client time data
 *
 * <dl>
 *   <dt>referenceTime</dt><dd>Real server time at last time change</dd>
 *   <dt>virtualTime</dt><dd>Chosen virtual time start at last time change</dd>
 *   <dt>computedNow</dt><dd>Current virtual time computed by server as virtualTime + (referenceTime - now) * speed</dd>
 *   <dt>speed</dt><dd>Speed of virtual time flow</dd>
 * </dl>
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientTimeData {

  private Long referenceTime;
  private Long virtualTime;
  private Long computedNow;
  private SpeedEnum speed;
}
