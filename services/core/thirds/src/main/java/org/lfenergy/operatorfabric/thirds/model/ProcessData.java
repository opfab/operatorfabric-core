/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.thirds.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Process Model, documented at {@link Process}
 *
 * {@inheritDoc}
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class ProcessData implements Process {

  private String id;
  private String name;
  private String version;
  @Singular
  private List<String> templates;
  @Singular
  private List<String> csses;
  private String menuLabel;
  @Singular("menuEntryData")
  @JsonIgnore
  private List<? extends MenuEntry> menuEntriesData;
  @Singular("stateData")
  private Map<String, ProcessStatesData> statesData;

  @Override
  public Map<String, ? extends ProcessStates> getStates(){
    return statesData;
  }

  @Override
  public void setStates(Map<String, ? extends ProcessStates> statesData){
    this.statesData = new HashMap<>((Map<String, ProcessStatesData>) statesData);
  }

  @Override
  public List<? extends MenuEntry> getMenuEntries(){
    return menuEntriesData;
  }

  @Override
  public void setMenuEntries(List<? extends MenuEntry> menuEntries){
    try {
      this.menuEntriesData = new ArrayList<>((List <MenuEntryData>) menuEntries);
    }
    catch (ClassCastException exception) {
      log.error("Unexpected Error arose ", exception);
    }
  }

}
