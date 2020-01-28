
package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.model.UserSettingsData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Mongo {@link UserData} repository
 * @author David Binder
 */
@Repository
public interface UserSettingsRepository extends MongoRepository<UserSettingsData,String> {

}
