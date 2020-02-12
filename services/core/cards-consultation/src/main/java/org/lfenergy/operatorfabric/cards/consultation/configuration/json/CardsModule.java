/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.consultation.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nConsultationData.class);
    addAbstractTypeMapping(Card.class,CardConsultationData.class);
    addAbstractTypeMapping(Detail.class,DetailConsultationData.class);
    addAbstractTypeMapping(Input.class,InputConsultationData.class);
    addAbstractTypeMapping(Recipient.class,RecipientConsultationData.class);
    addAbstractTypeMapping(ParameterListItem.class,ParameterListItemConsultationData.class);
    addAbstractTypeMapping(LightCard.class,LightCardConsultationData.class);
    }
}
