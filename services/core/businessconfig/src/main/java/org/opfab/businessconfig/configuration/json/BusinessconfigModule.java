/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.opfab.businessconfig.model.Process;
import org.opfab.businessconfig.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 *
 */
public class BusinessconfigModule extends SimpleModule {

    public BusinessconfigModule() {
        addAbstractTypeMapping(Process.class,ProcessData.class);
        addAbstractTypeMapping(ProcessStates.class, ProcessStatesData.class);
        addAbstractTypeMapping(I18n.class, I18nData.class);
        addAbstractTypeMapping(Recipient.class, RecipientData.class);
        addAbstractTypeMapping(UserCard.class, UserCardData.class);
        addAbstractTypeMapping(Response.class, ResponseData.class);
        addAbstractTypeMapping(ProcessUiVisibility.class,ProcessUiVisibilityData.class);
        addAbstractTypeMapping(ProcessGroup.class, ProcessGroupData.class);
        addAbstractTypeMapping(ProcessGroups.class,ProcessGroupsData.class);
        addAbstractTypeMapping(ProcessGroupsLocale.class, ProcessGroupsLocaleData.class);
        addAbstractTypeMapping(Monitoring.class, MonitoringData.class);
        addAbstractTypeMapping(MonitoringExport.class, MonitoringExportData.class);
        addAbstractTypeMapping(MonitoringExportField.class, MonitoringExportFieldData.class);
    }
}
