/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.publication.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nPublicationData.class);
    addAbstractTypeMapping(Card.class,CardPublicationData.class);
    addAbstractTypeMapping(LightCard.class,LightCardPublicationData.class);
    addAbstractTypeMapping(Detail.class,DetailPublicationData.class);
    addAbstractTypeMapping(Recipient.class,RecipientPublicationData.class);
    addAbstractTypeMapping(CardOperation.class,CardOperationData.class);
    addAbstractTypeMapping(CardCreationReport.class,CardCreationReportData.class);
    addAbstractTypeMapping(TimeSpan.class,TimeSpanPublicationData.class);
    addAbstractTypeMapping(Recurrence.class,RecurrencePublicationData.class);
    addAbstractTypeMapping(HoursAndMinutes.class,HoursAndMinutesPublicationData.class);
    }
}
