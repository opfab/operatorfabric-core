/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.utilities;


public class StringUtils {

    /**
     * Utility class don't need to be instantiated;
     */
    private StringUtils(){
    }

    /**
     * delete characters "/" and "\" from a string
     * @param stringToSanitize string to sanitize
     */
    public static String sanitize(String stringToSanitize) {
        String sanitizedString;

        if (stringToSanitize == null)
            return null;

        sanitizedString = stringToSanitize.replace("\\", "");
        sanitizedString = sanitizedString.replace("/", "");

        return sanitizedString;
    }
}
