/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 22/06/18
 *
 * @author David Binder
 */
public class SpeedEnumShould {

  @Test
  public void findSpeedByCoef(){
    assertThat(SpeedEnum.fromCoef(1f)).isEqualTo(SpeedEnum.X1);
    assertThat(SpeedEnum.fromCoef(2f)).isEqualTo(SpeedEnum.X2);
    assertThat(SpeedEnum.fromCoef(60f)).isEqualTo(SpeedEnum.X60);
    assertThat(SpeedEnum.fromCoef(3600f)).isEqualTo(SpeedEnum.X3600);
    assertThat(SpeedEnum.fromCoef(0.5f)).isEqualTo(SpeedEnum.HALF);
  }

}