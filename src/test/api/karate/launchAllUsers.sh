#/bin/sh

rm -rf target

# Be careful : patchUserSettings must be before fetchUserSettings

java -jar karate.jar                                     \
      users/createUsers.feature                          \
      users/groups/createGroups.feature                  \
      users/groups/addUsersToGroup.feature               \
      users/entities/createEntities.feature              \
      users/entities/addUsersToEntity.feature            \
      users/patchUserSettings.feature                    \
      users/fetchExistingUser.feature                    \
      users/fetchUserSettings.feature                    \
      users/groups/getGroupDetails.feature               \
      users/groups/getGroups.feature                     \
      users/entities/getEntityDetails.feature            \
      users/entities/getEntities.feature                 \
      users/getUsers.feature                             \
      users/groups/updateExistingGroup.feature           \
      users/entities/updateExistingEntity.feature        \
      users/updateExistingUser.feature                   \
      users/groups/updateListOfGroupUsers.feature        \
      users/groups/deleteAllUsersFromAGroup.feature      \
      users/groups/deleteUserFromGroup.feature           \
      users/entities/updateListOfEntityUsers.feature     \
      users/entities/deleteAllUsersFromAnEntity.feature  \
      users/entities/deleteUserFromEntity.feature

