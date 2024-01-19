/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

import org.springframework.validation.annotation.Validated;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public class Process {

  private String id;
  private String name;
  private String version;
  @Singular
  private Map<String, ProcessStates> states;
  private ProcessUiVisibility uiVisibility;

  public Map<String, ProcessStates> getStates() {
    return states;
  }

  public ProcessUiVisibility getUiVisibility() {
    return uiVisibility;
  }

  public void setStates(Map<String, ProcessStates> states) {
    this.states = new HashMap<>(states);
  }

  public void setUiVisibility(ProcessUiVisibility uiVisibilityData) {
    this.uiVisibility = uiVisibilityData;
  }

}
