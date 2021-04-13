/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.publication.repositories;

import java.util.List;

import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ArchivedCardRepositoryForTest extends MongoRepository<ArchivedCardPublicationData,String> {

    public List<ArchivedCardPublicationData> findByProcessInstanceId(String processInstanceId);
}
