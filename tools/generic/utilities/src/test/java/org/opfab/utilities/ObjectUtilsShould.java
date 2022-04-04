/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.utilities;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class ObjectUtilsShould {

    @Test
    void testGetNotNullOrDefault() {
        assertThat(ObjectUtils.getNotNullOrDefault("value", "default")).isEqualTo("value");
        assertThat(ObjectUtils.getNotNullOrDefault(null, "default")).isEqualTo("default");
        
        assertThat(ObjectUtils.getNotNullOrDefault("value", "default", String::new)).isEqualTo("value");
        assertThat(ObjectUtils.getNotNullOrDefault(null, "default", String::new)).isEqualTo("default");

        String a = null;
        String b = null;
        assertThat(ObjectUtils.getNotNullOrDefault(a, b)).isNull();
        assertThat(ObjectUtils.getNotNullOrDefault(a, b, String::new)).isNull();
        
    }
}