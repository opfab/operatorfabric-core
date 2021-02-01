Feature: deleteUserFromGroup

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


   #defining groups
    * def groupKarate2 =
"""
{
  "id" : "groupKarate2",
  "description" : "group to delete after the test"
}
"""

    # defining users to create
    * def userKarate2 =
"""
{
   "login" : "loginKarate2",
   "firstName" : "name2",
   "lastName" : "familyname2"
}
"""

    * def usersArray =
"""
[   "loginkarate2"
]
"""

  # First, create the group
  Scenario: create the group
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate2
    When method post
    Then status 201


  Scenario: Create the user
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate2
    When method post
    Then status 201
    And match response.login == karate.lowerCase(userKarate2.login)
    And match response.firstName == userKarate2.firstName
    And match response.lastName == userKarate2.lastName


  Scenario: affect a user to the group

    Given url opfabUrl + 'users/groups/' + groupKarate2.id +'/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method put
    Then status 200


  Scenario: Delete user from a group (with operator1 authentication)
    #Given url opfabUrl + 'users/groups/' + groupDeletedFrom + '/users/' + userToDelete
    Given url opfabUrl + 'users/groups/' + groupKarate2.id  + '/users/' + karate.lowerCase(userKarate2.login)
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: No authentication, expected response 401
    Given url opfabUrl + 'users/groups/' + groupKarate2.id  + '/users/' + karate.lowerCase(userKarate2.login)
    When method delete
    Then status 401


  Scenario: Delete user from a non-existent group
  #  non-existent group, expected response 404
    Given def userToDelete = 'operator3'
    Given url opfabUrl + 'users/groups/' + 'groupNonExistent'  + '/users/' + karate.lowerCase(userKarate2.login)
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  #delete /groups/{name}/users/{login}
  Scenario: Delete user from a group (with admin authentication)
    Given url opfabUrl + 'users/groups/' + groupKarate2.id  + '/users/' + karate.lowerCase(userKarate2.login)
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200
