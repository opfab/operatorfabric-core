/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class MonitoringExportFieldData implements MonitoringExportField {
  private String columnName;


  private String jsonField;    
  
  @JsonInclude(JsonInclude.Include.NON_NULL)
  private List<? extends MonitoringExportField> fields;  
}
