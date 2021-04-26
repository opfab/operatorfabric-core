/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.test;

import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.opfab.test.AssertUtils.assertException;

/**
 * <p></p>
 * Created on 25/06/18
 *
 *
 */
public class TestUtilsShould {

  @Test
  public void testException(){
    assertException(IOException.class).isThrownBy(()->{
      throw new IOException();
    });
    assertException(AssertionError.class).isThrownBy(()-> {
      assertException(IOException.class).isThrownBy(() -> {
        int i = 0;
        i++;
      });
    });
  }

}
