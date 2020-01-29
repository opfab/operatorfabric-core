/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.springtools.error.model;

import lombok.Getter;

/**
 * Exception used to to throw error during endpoint access. Encapsulate both an {@link ApiError} object and a cause
 * exception from business layer
 *
 * @author David Binder
 */
@Getter()
public class ApiErrorException extends RuntimeException {
    private final ApiError error;

    /**
     * @param error
     *    encapsulated error representation
     * @param message
     *    The detail message. The detail message is saved for
     *    later retrieval by the {@link #getMessage()} method.
     * @param cause
     *    The cause (which is saved for later retrieval by the
     *    {@link #getCause()} method).  (A <tt>null</tt> value is
     *    permitted, and indicates that the cause is nonexistent or
     *    unknown.)
     */
    public ApiErrorException(ApiError error, String message, Throwable cause) {
        super(message, cause);
        this.error = error;
    }

    /**
     * @param error
     *    encapsulated error representation
     * @param message
     *    The detail message. The detail message is saved for
     *    later retrieval by the {@link #getMessage()} method.
     */
    public ApiErrorException(ApiError error, String message) {
        super(message);
        this.error = error;
    }

    /**
     * @param error
     *    encapsulated error representation
     * @param cause
     *    The cause (which is saved for later retrieval by the
     *    {@link #getCause()} method).  (A <tt>null</tt> value is
     *    permitted, and indicates that the cause is nonexistent or
     *    unknown.)
     */
    public ApiErrorException(ApiError error, Throwable cause) {
        super(error.getMessage(), cause);
        this.error = error;
    }

    /**
     * @param error
     *    encapsulated error representation
     */
    public ApiErrorException(ApiError error) {
        super(error.getMessage());
        this.error = error;
    }


}
