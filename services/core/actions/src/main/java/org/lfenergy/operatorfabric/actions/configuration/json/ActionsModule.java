
package org.lfenergy.operatorfabric.actions.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.actions.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class ActionsModule extends SimpleModule {

    public ActionsModule() {

        addAbstractTypeMapping(I18n.class, I18nData.class);
        addAbstractTypeMapping(Action.class, ActionData.class);
        addAbstractTypeMapping(ActionStatus.class, ActionStatusData.class);
        addAbstractTypeMapping(Input.class, InputData.class);
        addAbstractTypeMapping(ParameterListItem.class, ParameterListItemData.class);
    }
}
