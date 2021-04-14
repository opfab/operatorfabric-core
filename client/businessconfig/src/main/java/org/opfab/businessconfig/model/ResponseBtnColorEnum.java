/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

/**
 * Response associated button color
 * <dl>
 *     <dt>RED</dt><dd>Red button</dd>
 *     <dt>GREEN</dt><dd>Green button</dd>
 *     <dt>YELLOW</dt><dd>Yellow button</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding
 * enum definition in the Cards API.
 *
 *
 */
public enum ResponseBtnColorEnum {
    RED, GREEN, YELLOW
}

