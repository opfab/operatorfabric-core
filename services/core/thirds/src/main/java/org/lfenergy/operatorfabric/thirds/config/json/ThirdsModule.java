package org.lfenergy.operatorfabric.thirds.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.thirds.model.ThirdMedias;
import org.lfenergy.operatorfabric.thirds.model.ThirdMediasData;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class ThirdsModule extends SimpleModule {

    public ThirdsModule() {
        addAbstractTypeMapping(ThirdMedias.class, ThirdMediasData.class);
    }
}
