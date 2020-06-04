/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.utilities;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ArrayUtilsShould {

    @Test
    public void copyOfRange(){
        String[] stringSource = {"zero","one","two","three"};
        assertThat(ArrayUtils.copyOfRange(stringSource, 2)).contains("two","three");

        Integer[] intSource = {0,1,2,3};
        assertThat(ArrayUtils.copyOfRange(intSource, 1)).contains(1,2,3);

    }
}
