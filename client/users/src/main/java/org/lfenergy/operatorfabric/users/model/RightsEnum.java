/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.model;

/**
 * Rights for a process/state (process/state/rights then associated to one or more group(s))
 *
 * <dl>
 *     <dt>READ</dt><dd>Only read rights (reading card)</dd>
 *     <dt>READANDWRITE</dt><dd>Read and write rights (reading card and creating new card)</dd>
 *     <dt>READANDRESPOND</dt><dd>Read and respond rights (reading card and responding to card)</dd>
 *     <dt>ALL</dt><dd>Read, write and respond rights (reading card, creating new card and responding to a card)</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Users API.
 *
 */
public enum RightsEnum {
    READ,
    READANDWRITE,
    READANDRESPOND,
    ALL
}