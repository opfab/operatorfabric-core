/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

public enum ResourceTypeEnum {
  CSS("css", ".css"),
  TEMPLATE("template", ".handlebars"),
  I18N(".", ".json"),
  RENDERING_COMPONENT("renderingComponents", ".js"), ;

  ResourceTypeEnum(String folder, String suffix) {
    this.folder = folder;
    this.suffix = suffix;
  } 
  /**
   * containing files subfolder name
   */
  private final String folder;
  private final String suffix;

  public String getFolder() {
    return folder;
  }

  public String getSuffix() {
    return suffix;
  }
}
