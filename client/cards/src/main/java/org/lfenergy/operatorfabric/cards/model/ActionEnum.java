/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

