/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.time.model;

/**
 * Speed of time flow in virtual time
 *
 * <dl>
 *     <dt>HALF</dt><dd>Half as fast</dd>
 *     <dt>X1</dt><dd>Normal speed</dd>
 *     <dt>X2</dt><dd>Twice as fast</dd>
 *     <dt>X10</dt><dd>Ten times as fast</dd>
 *     <dt>X60</dt><dd>60 times as fast(1s = 1min)</dd>
 *     <dt>X3600</dt><dd>3600 times faster (1s = 1hour)</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Time API.
 *
 * @author David Binder
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
