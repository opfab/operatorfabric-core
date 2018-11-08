/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Models Third resource type, used generalize {@link org.lfenergy.operatorfabric.thirds.services.ThirdsService} code
 * <dl>
 *     <dt>CSS</dt><dd></dd>
 *     <dt>MEDIA</dt><dd></dd>
 *     <dt>TEMPLATE</dt><dd></dd>
 *     <dt>I18N</dt><dd></dd>
 * </dl>
 *
 * @author David Binder
 */
@Getter
@AllArgsConstructor
public enum ResourceTypeEnum {
  CSS("css", ".css", false),
  MEDIA("media", "", true),
  TEMPLATE("template", ".handlebars", true),
  I18N("i18n", ".properties", true);

  /**
   * containing files subfolder name
   */
  private final String folder;
  /**
   * usual suffix if any
   */
  private final String suffix;
  /**
   * is the resource localized
   */
  private final boolean localized;

}