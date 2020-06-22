/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.thirds.model;

/**
 * The type of input
 * <dl>
 *     <dt>TEXT</dt><dd>This input will be displayed as an input text</dd>
 *     <dt>LIST</dt><dd>This input will be displayed as a dropbox</dd>
 *     <dt>MULTI_LIST</dt><dd>This input will be displayed as multivalued list input</dd>
 *     <dt>SWITCH_LIST</dt><dd>This input is displayed as two list whose values may be exchanged</dd>
 *     <dt>LONG_TEXT</dt><dd>This input will be displayed as a multi line input text</dd>
 *     <dt>BOOLEAN</dt><dd>This input will be displayed as a boolean</dd>
 *     <dt>STATIC</dt><dd>This input won't be displayed, it may serve as a constant parameter</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 *
 */
public enum InputEnum {
  
  TEXT,
  LIST,
  MULTI_LIST,
  SWITCH_LIST,
  LONGTEXT,
  BOOLEAN,
  STATIC
}

