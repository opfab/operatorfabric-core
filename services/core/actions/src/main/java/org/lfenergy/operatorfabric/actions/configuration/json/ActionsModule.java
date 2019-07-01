/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class ActionsModule extends SimpleModule {

    public ActionsModule() {

//    addAbstractTypeMapping(I18n.class,I18nConsultationData.class);
    }
}
