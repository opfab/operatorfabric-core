/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.model;

/**
 * <p></p>
 * Created on 19/06/18
 *
 * @author davibind
 */
public enum SpeedEnum {
  X1(1f), X2(2f), X10(10f), X60(60f), X3600(3600f), HALF(.5f);

  public final float coef;

  private SpeedEnum(float coef) {
    this.coef = coef;
  }

  public static SpeedEnum fromCoef(float coef) {
    for (SpeedEnum speedEnum : SpeedEnum.values()) {
      if (Float.compare(speedEnum.coef,coef)==0) {
        return speedEnum;
      }
    }
    return null;
  }
}
