/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.businessconfig.model;

import lombok.*;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

/**
 * ProcessGroups Model, documented at {@link ProcessGroups}
 *
 * {@inheritDoc}
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class ProcessGroupsData implements ProcessGroups {

  private List<? extends ProcessGroup>  groups;
  private ProcessGroupsLocale           locale;

  public void clear(){
      this.groups.clear();
      this.locale = new ProcessGroupsLocaleData();
  }
}
