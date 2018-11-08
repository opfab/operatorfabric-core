package org.lfenergy.operatorfabric.time.model;

/**
 *
 * <dl>
 *     <dt>HALF</dt><dd>Half time as fast</dd>
 *     <dt>X1</dt><dd>Normal speed</dd>
 *     <dt>X2</dt><dd>Twice as fast</dd>
 *     <dt>X10</dt><dd>Ten time faster</dd>
 *     <dt>X60</dt><dd>60 time faster (1s = 1min)</dd>
 *     <dt>X3600</dt><dd>3600 time faster (1s = 1hour)</dd>
 * </dl>
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
