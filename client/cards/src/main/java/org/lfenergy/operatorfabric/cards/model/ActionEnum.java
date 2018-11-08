package org.lfenergy.operatorfabric.cards.model;

/**
 * Card associated Action type
 * <dl>
 *     <dt>EXTERNAL</dt><dd>Not defined</dd>
 *     <dt>JNLP</dt><dd>The actions triggers a JNLP link</dd>
 *     <dt>URI</dt><dd>The actions is tied to a uri which must conform the specification of 3rd Party action (see reference manual)</dd>
 * </dl>
 *
 * @author David Binder
 */
public enum ActionEnum {
  EXTERNAL,
  JNLP,
  URI
}

