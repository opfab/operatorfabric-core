/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.core.convert.converter.Converter;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;
/**
 *
 * <p>Spring converter to register {@link RecipientPublicationData} in mongoDB</p>
 * <p>Converts {@link RecipientPublicationData} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class RecipientWriterConverter implements Converter<RecipientPublicationData, Document> {

    @Override
    public Document convert(RecipientPublicationData source) {
        Document result = new Document();
        @NotNull @Valid RecipientEnum type = source.getType();
        result.append("type", type.toString());
        String identity = source.getIdentity();
        if (identity != null) {
            result.append("identity", identity);
        }
        Boolean preserveMain = source.getPreserveMain();
        if (preserveMain != null) {
            result.append("preserveMain", preserveMain);
        }
        List<? extends Recipient> recipients = source.getRecipients();
        if (recipients != null) {
            List<Document> recipientsAsDocuments = recipients.stream()
                    .map(recipient -> this.convert((RecipientPublicationData) recipient))
                    .collect(Collectors.toList());
            result.append("recipients", recipientsAsDocuments);
        }
        return result;
    }
}
