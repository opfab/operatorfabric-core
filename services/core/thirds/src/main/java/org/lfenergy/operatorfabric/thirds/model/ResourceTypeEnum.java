/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.thirds.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Models Third resource types
 */
@Getter
@AllArgsConstructor
public enum ResourceTypeEnum {
  CSS("css", ".css", false),
  MEDIA("media", "", true),
  TEMPLATE("template", ".handlebars", true),
  I18N("i18n", ".properties", true);

  private final String folder;
  private final String suffix;
  private final boolean localized;

}