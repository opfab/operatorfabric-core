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
 *   <dt>BROADCAST</dt><dd>Card is sent to everyone</dd>
 *   <dt>DEADEND</dt><dd>Card is sent to no one (Mostly for testing purposes)</dd>
 *   <dt>GROUP</dt><dd>Card is sent to a whole group</dd>
 *   <dt>TSO</dt><dd>Deprecated alias for GROUP</dd>
 *   <dt>UNION</dt><dd>Card is sent to the union of underlying recipients</dd>
 *   <dt>INTERSECT</dt><dd>Card is sent to the union of underlying recipients but an intersection of the groups severs as pool of user to determine main recipient</dd>
 *   <dt>USER</dt><dd>Card is sent to a specified user</dd>
 *   <dt>FAVORITE</dt><dd>Card is sent to underlying recipient, if favorite specified user is available, it is set as main recipient</dd>
 *   <dt>RANDOM</dt><dd>Card is sent to underlying recipient, a main recipient is randomly set</dd>
 *   <dt>WEIGHTED</dt><dd>Card is sent to underlying recipient, a main recipient is randomly set but a specified user is favored</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 * 
 * @author David Binder
 */
public enum RecipientEnum {
  
  BROADCAST,
  DEADEND,
  FAVORITE,
  GROUP,
  INTERSECT,
  RANDOM,
  @Deprecated
  TSO,
  UNION,
  USER,
  WEIGHTED
}

