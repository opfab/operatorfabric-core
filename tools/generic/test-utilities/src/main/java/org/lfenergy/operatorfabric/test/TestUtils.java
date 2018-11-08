/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.test;

import org.assertj.core.api.ThrowableTypeAssert;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

/**
 * <p></p>
 * Created on 16/04/18
 *
 * @author davibind
 */
public class TestUtils {

  /**
   * Utility class don't need to be instantiated;
   */
  private TestUtils(){};

  /**
   * more compact {@linkplain org.assertj.core.api.Assertions#assertThatExceptionOfType}
   * @param exceptionType
   * @return
   */
  public static ThrowableTypeAssert<? extends Throwable> assertException(Class<? extends Throwable> exceptionType) {
    return assertThatExceptionOfType(exceptionType);
  }
}
