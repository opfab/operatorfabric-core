/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.time.model.ServerTimeData;
import org.lfenergy.operatorfabric.time.model.TimeData;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class TimeModule extends SimpleModule {

  public TimeModule(){

    addAbstractTypeMapping(TimeData.class,ServerTimeData.class);
  }
}
