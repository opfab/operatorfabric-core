#/bin/sh

rm -rf target

# Be careful : patchUserSettings must be before fetchUserSettings

java -jar karate.jar                          \
      users/createUsers.feature               \
      users/createGroups.feature              \
      users/addUsersToGroup.feature           \
      users/patchUserSettings.feature         \
      users/fetchExistingUser.feature         \
      users/fetchUserSettings.feature         \
      users/getGroupDetails.feature           \
      users/getGroups.feature                 \
      users/getUsers.feature                  \
      users/updateExistingGroup.feature       \
      users/updateExistingUser.feature        \
      users/updateListOfGroupUsers.feature    \
      users/deleteAllUsersFromAGroup.feature  \
      users/deleteUserFromGroup.feature

