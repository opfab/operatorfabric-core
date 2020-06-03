/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.test;

import org.assertj.core.api.ThrowableTypeAssert;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

/**
 * Collection of assertion utilities
 *
 *
 */
public class AssertUtils {

  /**
   * Utility class doesn't need to be instantiated;
   */
  private AssertUtils(){};

  /**
   * More compact than {@linkplain org.assertj.core.api.Assertions#assertThatExceptionOfType}
   * @param exceptionType the exception type class
   * @return the created {@link ThrowableTypeAssert}
   */
  public static ThrowableTypeAssert<? extends Throwable> assertException(Class<? extends Throwable> exceptionType) {
    return assertThatExceptionOfType(exceptionType);
  }
}
