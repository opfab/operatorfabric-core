/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link Recipient} using
 * {@link RecipientPublicationData} builder</p>
 *
 */
public class RecipientReadConverter implements Converter<Document,Recipient> {
    @Override
    public Recipient convert(Document source) {
        RecipientPublicationData.RecipientPublicationDataBuilder builder =
            RecipientPublicationData.builder()
                .type(RecipientEnum.valueOf(source.getString("type")))
                .identity(source.getString("identity"));
        List<Document> recipientsDocument = (List<Document>) source.get("recipients");
        if(recipientsDocument!=null)
            for(Document d:recipientsDocument){
                builder.recipient(this.convert(d));
            }

        return builder.build();
    }
}
