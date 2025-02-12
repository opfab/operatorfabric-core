/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.junit.jupiter.api.Test;
import org.opfab.cards.publication.DataExtractor;

import static org.junit.jupiter.api.Assertions.*;
import java.util.Arrays;
import java.util.LinkedHashMap;

class DataExtractorShould {

    @Test
    void testExtractFields() {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("name", "John Doe");
        data.put("age", 30);
        LinkedHashMap<String, Object> address = new LinkedHashMap<>();
        address.put("street", "123 Main St");
        address.put("city", "Anytown");
        data.put("address", address);

        Object result = DataExtractor.extractFields(data, Arrays.asList("name", "address.city"));

        LinkedHashMap<String, Object> expected = new LinkedHashMap<>();
        expected.put("name", "John Doe");
        LinkedHashMap<String, Object> expectedAddress = new LinkedHashMap<>();
        expectedAddress.put("city", "Anytown");
        expected.put("address", expectedAddress);

        assertEquals(expected, result);
    }

    @Test
    void testExtractFieldsWithNonExistentField() {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("name", "John Doe");

        Object result = DataExtractor.extractFields(data, Arrays.asList("name", "nonExistentField"));

        LinkedHashMap<String, Object> expected = new LinkedHashMap<>();
        expected.put("name", "John Doe");

        assertEquals(expected, result);
    }

    @Test
    void testExtractFieldsWithNestedNonExistentField() {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("name", "John Doe");
        LinkedHashMap<String, Object> address = new LinkedHashMap<>();
        address.put("street", "123 Main St");
        data.put("address", address);

        Object result = DataExtractor.extractFields(data, Arrays.asList("name", "address.city"));

        LinkedHashMap<String, Object> expected = new LinkedHashMap<>();
        expected.put("name", "John Doe");
        LinkedHashMap<String, Object> expectedAddress = new LinkedHashMap<>();

        expected.put("address", expectedAddress);

        assertEquals(expected, result);
    }
}
