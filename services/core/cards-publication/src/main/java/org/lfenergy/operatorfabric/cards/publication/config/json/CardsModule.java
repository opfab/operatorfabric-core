/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.model.*;
import org.lfenergy.operatorfabric.cards.publication.model.*;

/**
 * <p></p>
 * Created on 14/06/18
 *
 * @author davibind
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nPublicationData.class);
    addAbstractTypeMapping(Card.class,CardPublicationData.class);
    addAbstractTypeMapping(LightCard.class,LightCardPublicationData.class);
    addAbstractTypeMapping(Action.class,ActionPublicationData.class);
    addAbstractTypeMapping(Detail.class,DetailPublicationData.class);
    addAbstractTypeMapping(Input.class,InputPublicationData.class);
    addAbstractTypeMapping(Recipient.class,RecipientPublicationData.class);
    addAbstractTypeMapping(ParameterListItem.class,ParameterListItemPublicationData.class);
    addAbstractTypeMapping(CardOperation.class,CardOperationData.class);
    addAbstractTypeMapping(CardCreationReport.class,CardCreationReportData.class);
    }
}
