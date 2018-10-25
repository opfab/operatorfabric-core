/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.GroupData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * <p></p>
 * Created on 24/07/18
 *
 * @author davibind
 */
@Repository
public interface GroupRepository extends MongoRepository<GroupData,String> {

    Page<GroupData> findAll(Pageable pageable);

}
