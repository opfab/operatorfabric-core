/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.utilities;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StringUtilsShould {

    @Test
    void testSanitize() {
        assertThat(StringUtils.sanitize(null)).isNull();
        assertThat(StringUtils.sanitize("string/To\\San/iti\\ze")).isEqualTo("stringToSanitize");
        assertThat(StringUtils.sanitize("stringToSanitize")).isEqualTo("stringToSanitize");
    }
}