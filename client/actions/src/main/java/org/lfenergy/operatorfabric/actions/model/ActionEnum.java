/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.actions.model;

/**
 * Card associated Action type
 * <dl>
 *     <dt>EXTERNAL</dt><dd>Not defined</dd>
 *     <dt>JNLP</dt><dd>The action triggers a JNLP link</dd>
 *     <dt>URL</dt><dd>The action is tied to a url which must conform the specification of 3rd Party actions (see reference manual)</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 * @author David Binder
 */
public enum ActionEnum {
  EXTERNAL,
  JNLP,
  URL
}

