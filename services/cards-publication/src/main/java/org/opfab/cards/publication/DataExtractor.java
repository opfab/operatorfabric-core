/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DataExtractor {

    private DataExtractor() {
        throw new IllegalStateException("Utility class, do not instance");
    }

    public static Object extractFields(Object data, List<String> fields) {
        if (!(data instanceof LinkedHashMap)) {
            throw new IllegalArgumentException("Data must be a LinkedHashMap");
        }

        LinkedHashMap<String, Object> originalData = (LinkedHashMap<String, Object>) data;
        LinkedHashMap<String, Object> newData = new LinkedHashMap<>();

        for (String field : fields) {
            String[] nestedFields = field.split("\\.");
            extractNestedField(originalData, newData, nestedFields, 0);
        }

        return newData;
    }

    private static void extractNestedField(Map<String, Object> originalData, Map<String, Object> newData, String[] nestedFields, int index) {
        String currentField = nestedFields[index];
        if (!originalData.containsKey(currentField)) {
            return;
        }

        if (index == nestedFields.length - 1) {
            newData.put(currentField, originalData.get(currentField));
        } else {
            Object nestedData = originalData.get(currentField);
            if (nestedData instanceof Map) {
                Map<String, Object> nestedNewData = (Map<String, Object>) newData.computeIfAbsent(currentField, k -> new LinkedHashMap<>());
                extractNestedField((Map<String, Object>) nestedData, nestedNewData, nestedFields, index + 1);
            }
        }
    }
}
