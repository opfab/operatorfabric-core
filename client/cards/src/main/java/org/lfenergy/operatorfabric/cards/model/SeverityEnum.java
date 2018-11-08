/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.model;

/**
 * Severity of the card content
 *
 * <dl>
 *     <dt>ALARM</dt><dd>Action is needed and the emitter process may be in critical state</dd>
 *     <dt>ACTION</dt><dd>Action is needed</dd>
 *     <dt>NOTIFICATION</dt><dd>Card content is informational only</dd>
 *     <dt>QUESTION</dt><dd>Some information is required from card recipient</dd>
 * </dl>
 *
 * Created on 10/07/18
 *
 * @author David Binder
 */
public enum SeverityEnum {
    ALARM,
    ACTION,
    NOTIFICATION,
    QUESTION
}
