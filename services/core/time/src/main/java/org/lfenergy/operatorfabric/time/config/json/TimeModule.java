/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.time.model.ServerTimeData;
import org.lfenergy.operatorfabric.time.model.TimeData;

/**
 * <p></p>
 * Created on 14/06/18
 *
 * @author davibind
 */
public class TimeModule extends SimpleModule {

  public TimeModule(){

    addAbstractTypeMapping(TimeData.class,ServerTimeData.class);
  }
}
