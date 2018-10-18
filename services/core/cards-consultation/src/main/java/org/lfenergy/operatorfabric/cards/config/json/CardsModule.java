/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.model.*;

/**
 * <p></p>
 * Created on 14/06/18
 *
 * @author davibind
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nData.class);
    addAbstractTypeMapping(Card.class,CardData.class);
    addAbstractTypeMapping(Action.class,ActionData.class);
    addAbstractTypeMapping(Detail.class,DetailData.class);
    addAbstractTypeMapping(Input.class,InputData.class);
    addAbstractTypeMapping(Recipient.class,RecipientData.class);
    addAbstractTypeMapping(ParameterListItem.class,ParameterListItemData.class);
    }
}
