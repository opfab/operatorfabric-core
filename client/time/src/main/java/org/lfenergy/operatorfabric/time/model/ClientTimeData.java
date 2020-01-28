
package org.lfenergy.operatorfabric.time.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Client time data
 *
 * <dl>
 *   <dt>referenceTime</dt><dd>Real server time at last time change</dd>
 *   <dt>virtualTime</dt><dd>Chosen virtual time start at last time change</dd>
 *   <dt>computedNow</dt><dd>Current virtual time computed by server as virtualTime + (now - referenceTime) * speed</dd>
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

  private Instant referenceTime;
  private Instant virtualTime;
  private Instant computedNow;
  private SpeedEnum speed;
}
