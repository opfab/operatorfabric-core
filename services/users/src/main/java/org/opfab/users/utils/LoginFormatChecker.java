/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.utils;

public class LoginFormatChecker {

    private static final String MANDATORY_LOGIN_MISSING = "Mandatory 'login' field is missing.";
    private static final String LOGIN_FIELD_PATTERN_MSG = "Login should only contain the following characters: letters, _, -, . or digits (login=%s).";
    private static final String LOGIN_FIELD_MIN_LENGTH_MSG = "Login should be minimum 2 characters (login=%s).";
    private static final String LOGIN_FIELD_PATTERN = "^[A-Za-z0-9-_.]+$";

    private LoginFormatChecker(){}

    public static class LoginCheckResult {
        private boolean valid;
        private String errorMessage;

        public LoginCheckResult(boolean valid, String errorMessage) {
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

    public static LoginCheckResult check(String id) {
        String errorMessage = "";

        if (id.length() == 0)
            errorMessage = MANDATORY_LOGIN_MISSING;
        else {
            if (id.length() == 1)
                errorMessage = String.format(LOGIN_FIELD_MIN_LENGTH_MSG, id);

            if (! id.matches(LOGIN_FIELD_PATTERN))
                errorMessage += String.format(LOGIN_FIELD_PATTERN_MSG, id);
        }

        if (errorMessage.length() > 0) return new LoginCheckResult(false, errorMessage);
        else return new LoginCheckResult(true,"");
            
    }
}
