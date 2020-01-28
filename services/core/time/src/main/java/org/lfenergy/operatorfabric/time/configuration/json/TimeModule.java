
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
