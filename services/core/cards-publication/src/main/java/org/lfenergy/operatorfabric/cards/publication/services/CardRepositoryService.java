/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import java.lang.reflect.Field;

/**
 * 
 * Responsible of Write of Cards in card and archiveCard mongo collection
 * 
 */
@Service
@Slf4j
public class CardRepositoryService {

    @Autowired
    private MongoTemplate template;

    public void saveCard(CardPublicationData card) {

        log.debug("preparing to write {}", card.toString());
        Document objDocument = new Document();
        template.getConverter().write(card, objDocument);

        Update update = new Update();
        // work around OC-709 : "Change card update mechanism in Mongo"
        for (Field f : CardPublicationData.class.getDeclaredFields()) {
            try {
                f.setAccessible(true);
                if (f.get(card) == null)
                    update.unset(f.getName());
            } catch (IllegalAccessException e) {
                log.error("Unable to access to field" + f.getName(), e);
            }
        }
        objDocument.entrySet().forEach(e -> update.set(e.getKey(), e.getValue()));
        this.template.upsert(Query.query(Criteria.where("_id").is(card.getId())), update, CardPublicationData.class);

    }

    public void saveCardToArchive(ArchivedCardPublicationData card) {
        this.template.insert(card);
    }

    public void deleteCard(CardPublicationData cardToDelete) {
        this.template.remove(cardToDelete);
    }

    public CardPublicationData findCardToDelete(String processId) {
        /**
         * Uses a projection instead the default 'findById' method. This projection
         * excludes data which can be unpredictably huge depending on publisher needs.
         */
        Query findCardByIdWithoutDataField = new Query();
        findCardByIdWithoutDataField.fields().exclude("data");
        findCardByIdWithoutDataField.addCriteria(Criteria.where("Id").is(processId));

        return this.template.findOne(findCardByIdWithoutDataField, CardPublicationData.class);
    }

}
