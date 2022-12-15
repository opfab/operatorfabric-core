/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.utils;

public class IdFormatChecker {

    private static final String ID_IS_REQUIRED_MSG = "Id is required.";
    private static final String ID_FIELD_PATTERN_MSG = "Id should only contain the following characters: letters, _, - or digits (id=%s).";
    private static final String ID_FIELD_MIN_LENGTH_MSG = "Id should be minimum 2 characters (id=%s).";
    private static final String ID_FIELD_PATTERN = "^[A-Za-z0-9-_]+$";


    private IdFormatChecker(){}

    public static class IdCheckResult {
        private boolean valid;
        private String errorMessage;

        public IdCheckResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

    }

    public static IdCheckResult check(String id) {
        String errorMessage = "";

        if (id.length() == 0)
            errorMessage = ID_IS_REQUIRED_MSG;
        else {
            if (id.length() == 1)
                errorMessage = String.format(ID_FIELD_MIN_LENGTH_MSG, id);

            if (! id.matches(ID_FIELD_PATTERN))
                errorMessage += String.format(ID_FIELD_PATTERN_MSG, id);
        }

        if (errorMessage.length() > 0) return new IdCheckResult(false, errorMessage);
        else return new IdCheckResult(true,"");
            
    }
}
