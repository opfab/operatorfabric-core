package org.lfenergy.operatorfabric.cards.model;

/**
 * Recipient type enumeration
 * 
 * <dl>
 *   <dt>BROADCAST</dt><dd>Card is sent to everyone</dd>
 *   <dt>DEADEND</dt><dd>Card is sent to no one (Mosty for testing purpose)</dd>
 *   <dt>GROUP</dt><dd>Card is sent to a whole group</dd>
 *   <dt>TSO</dt><dd>Depracated Alias for group</dd>
 *   <dt>UNION</dt><dd>Card is sent to the union of underlying recipients</dd>
 *   <dt>INTERSECT</dt><dd>Card is sent to the intersection of underlying recipients</dd>
 *   <dt>USER</dt><dd>Card is sent to a specified user</dd>
 *   <dt>FAVORITE</dt><dd>Card is sent to underlying recipient, if favorite specified user is available, it is set as main recipient</dd>
 *   <dt>RANDOM</dt><dd>Card is sent to underlying recipient, a main recipient is randomly set</dd>
 *   <dt>WEIGHTED</dt><dd>Card is sent to underlying recipient, a main recipient is randomly set but a specified user is favored</dd>
 * </dl>
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

