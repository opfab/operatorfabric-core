/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.utilities;

import java.util.function.UnaryOperator;

public class ObjectUtils {


    private ObjectUtils() {

    }

    /*
    * Returns the first argument if it is non-null and otherwise returns the second argument.
    */
    public static <T> T  getNotNullOrDefault(T value, T defaultValue) {
        return value != null ? value : defaultValue;
    }

    /*
    * Returns the result of tranform function applied to the first argument if first argument is non-null 
    * otherwise returns result of tranform function applied to the second argument if first second is non-null,
    * otherwise returns null
    */
    public static <T> T getNotNullOrDefault(T value, T defaultValue, UnaryOperator<T> transform) {
        if (value != null) {
            return transform.apply(value);
        } else if (defaultValue != null) {
            return transform.apply(defaultValue);
        }
        return null;
    }
}
