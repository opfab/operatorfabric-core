/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.opfab.cards.consultation.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class, I18nConsultationData.class);
    addAbstractTypeMapping(Card.class, CardConsultationData.class);
    addAbstractTypeMapping(LightCard.class, LightCardConsultationData.class);
    addAbstractTypeMapping(TimeSpan.class, TimeSpanConsultationData.class);
    addAbstractTypeMapping(Recurrence.class, RecurrenceConsultationData.class);
    addAbstractTypeMapping(HoursAndMinutes.class, HoursAndMinutesConsultationData.class);
    }
}
