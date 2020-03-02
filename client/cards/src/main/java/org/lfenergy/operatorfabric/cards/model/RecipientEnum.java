/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.model;

/**
 * Recipient type enumeration
 * 
 * <dl>
 *   <dt>DEADEND</dt><dd>Card is sent to no one (Mostly for testing purposes)</dd>
 *   <dt>GROUP</dt><dd>Card is sent to a whole group</dd>
 *   <dt>UNION</dt><dd>Card is sent to the union of underlying recipients</dd>
 *   <dt>USER</dt><dd>Card is sent to a specified user</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 */
public enum RecipientEnum {
  
  DEADEND,
  GROUP,
  UNION,
  USER
}

