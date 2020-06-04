/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.thirds.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Models Third resource type, used to generalize {@link org.lfenergy.operatorfabric.thirds.services.ThirdsService} code
 * <dl>
 *     <dt>CSS</dt><dd>cascading style sheet resource type</dd>
 *     <dt>TEMPLATE</dt><dd>Card template resource type</dd>
 *     <dt>I18N</dt><dd>i18n file resource type</dd>
 *     <dt>MENU_ITEM</dt><dd>Menu item resource type</dd>
 * </dl>
 *
 */
@Getter
@AllArgsConstructor
public enum ResourceTypeEnum {
  CSS("css", ".css", false),
  TEMPLATE("template", ".handlebars", true),
  I18N("i18n", ".json", true),
  MENU_ITEM("menu","",true);

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
