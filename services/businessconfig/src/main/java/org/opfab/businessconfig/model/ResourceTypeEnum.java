/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.opfab.businessconfig.services.ProcessesService;

/**
 * Models Businessconfig resource type, used to generalize {@link ProcessesService} code
 * <dl>
 *     <dt>CSS</dt><dd>cascading style sheet resource type</dd>
 *     <dt>TEMPLATE</dt><dd>Card template resource type</dd>
 *     <dt>I18N</dt><dd>i18n file resource type</dd>
 * </dl>
 *
 */
@Getter
@AllArgsConstructor
public enum ResourceTypeEnum {
  CSS("css", ".css", false),
  TEMPLATE("template", ".handlebars", false),
  I18N(".", ".json", false);

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
