
package org.lfenergy.operatorfabric.thirds.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.thirds.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class ThirdsModule extends SimpleModule {

    public ThirdsModule() {
        addAbstractTypeMapping(ThirdMedias.class, ThirdMediasData.class);
        addAbstractTypeMapping(ThirdMenuEntry.class, ThirdMenuEntryData.class);
        addAbstractTypeMapping(ThirdProcesses.class,ThirdProcessesData.class);
        addAbstractTypeMapping(ThirdStates.class,ThirdStatesData.class);
        addAbstractTypeMapping(Detail.class,DetailData.class);
        addAbstractTypeMapping(I18n.class,I18nData.class);
        addAbstractTypeMapping(Action.class,ActionData.class);
        addAbstractTypeMapping(Input.class,InputData.class);
        addAbstractTypeMapping(ParameterListItem.class,ParameterListItemData.class);
    }
}
