/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.repositories;

import java.util.Optional;

import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepositoryForTest extends MongoRepository<CardPublicationData,String> {

    public <List> CardPublicationData findByProcessInstanceId(String processInstanceId);
    
    public Optional <CardPublicationData> findByUid(String Uid);

    public Optional<CardPublicationData> findById(String id);
}
