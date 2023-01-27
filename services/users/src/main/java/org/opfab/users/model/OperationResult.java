/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

public class OperationResult<T> {
    private boolean success = true;
    private ErrorType errorType;
    private String errorMessage ;
    private T result;
    
   

    public enum ErrorType {
    NOT_FOUND, BAD_REQUEST,UNKNOWN_ERROR
  }
    
    public OperationResult(T result,boolean success, ErrorType errorType, String errorMessage) {
        this.result = result;
        this.success = success;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
    }


    public boolean isSuccess() {
        return success;
    }

    public ErrorType getErrorType() {
        return errorType;
    }

    public String getErrorMessage() {
        return errorMessage;
    }  

    public T getResult() {
        return this.result;
    }

    
}
