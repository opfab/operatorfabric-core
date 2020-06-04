/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link CardOperation} using {@link CardOperationConsultationData} builder.</p>
 *
 */
@Slf4j
public class CardOperationReadConverter implements Converter<Document, CardOperation> {
    LightCardReadConverter cardConverter = new LightCardReadConverter();
    @Override
    public CardOperation convert(Document source) {
        CardOperationConsultationData.CardOperationConsultationDataBuilder builder = CardOperationConsultationData.builder();
        builder.number(source.getLong("number"))
                .publishDate(source.getDate("publishDate").toInstant());
        String type = source.getString("type");
        if(type!=null)
            builder.type(CardOperationTypeEnum.valueOf(type));

        try {
            List<Document> cards = (List<Document>) source.get("cards");
            if(cards!=null)
                for(Document cardDoc:cards){
                    builder.card(cardConverter.convert(cardDoc));
                }
        }
        catch(ClassCastException exception){
                log.error("Unexpected Error arose ", exception);
        }
        List<String> cardIds = (List<String>) source.get("cardIds");
        if (cardIds != null)
            for (String id : cardIds) {
                builder.cardId(id);
            }
        return builder.build();
    }
}
