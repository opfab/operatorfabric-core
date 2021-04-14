/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.utilities;

import java.util.ArrayList;
import java.util.List;

/**
 * A collection of {@link java.util.Collections} utilities
 */
public class CollectionUtils {

    /**
     * Create an {@link ArrayList} from an array of elements
     * @param array the elements to add
     * @param <T> the elements' type
     * @return the created {@link ArrayList}
     */
    public static <T> List<T> createArrayList(T... array){
        List<T> result = new ArrayList<>();
        for (T t: array) {
            result.add(t);
        }

        return result;
    }
}
