/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Third Model, documented at {@link Third}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThirdData implements Third {

  private String name;
  private String version;
  @Singular
  private List<String> templates;
  @Singular
  private List<String> csses;
  @Singular("mediasData")
  @JsonIgnore
  private Map<String,ThirdMediasData> mediasData;
  @Singular("processesData")
  @JsonIgnore
  private Map<String,ThirdProcessesData> processesData;
  @Singular("menuEntryData")
  @JsonIgnore
  private List<? extends ThirdMenuEntry> menuEntriesData;
  private String i18nLabelKey;

  @Override
  public Map<String, ? extends ThirdProcesses> getProcesses(){
    return processesData;
  }

  @Override
  public void setProcesses(Map<String, ? extends ThirdProcesses> processesData){
    this.processesData = new HashMap<>((Map<String,ThirdProcessesData>) processesData);
  }

  @Override
  public Map<String, ? extends ThirdMedias> getMedias(){
    return mediasData;
  }

  @Override
  public void setMedias(Map<String, ? extends ThirdMedias> mediasData){
    this.mediasData = new HashMap<>((Map<String,ThirdMediasData>) mediasData);
  }

  @Override
  public List<? extends ThirdMenuEntry> getMenuEntries(){
    return menuEntriesData;
  }

  @Override
  public void setMenuEntries(List<? extends ThirdMenuEntry> menuEntries){
    this.menuEntriesData = new ArrayList<>((List < ThirdMenuEntryData >) menuEntries);
  }

}
