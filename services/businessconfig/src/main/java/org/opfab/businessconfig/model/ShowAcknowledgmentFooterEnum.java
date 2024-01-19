/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator;

public enum ShowAcknowledgmentFooterEnum {

  ONLYFOREMITTINGENTITY("OnlyForEmittingEntity"),

  ONLYFORUSERSALLOWEDTOEDIT("OnlyForUsersAllowedToEdit"),

  FORALLUSERS("ForAllUsers"),

  NEVER("Never");

  private String value;

  ShowAcknowledgmentFooterEnum(String value) {
    this.value = value;
  }

  @Override
  @JsonValue
  public String toString() {
    return String.valueOf(value);
  }

  @JsonCreator
  public static ShowAcknowledgmentFooterEnum fromValue(String text) {
    for (ShowAcknowledgmentFooterEnum b : ShowAcknowledgmentFooterEnum.values()) {
      if (String.valueOf(b.value).equals(text)) {
        return b;
      }
    }
    return null;
  }
}
