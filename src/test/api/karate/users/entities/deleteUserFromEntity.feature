Feature: deleteUserFromEntity

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


   #defining entities
    * def entityKarate2 =
"""
{
  "id" : "entityKarate2",
  "name" : "entityKarate2 name",
  "description" : "entity to delete after the test"
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
[   "loginKarate2"
]
"""

  # First, create the entity
  Scenario: create the entity
    Given url opfabUrl + 'users/entities'
    And header Authorization = 'Bearer ' + authToken
    And request entityKarate2
    When method post
    Then status 201


  Scenario: Create the user (if everything is ok, the user already exists)
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate2
    When method post
    Then status 200
    And match response.login == userKarate2.login
    And match response.firstName == userKarate2.firstName
    And match response.lastName == userKarate2.lastName


  Scenario: affect an user to the entity

    Given url opfabUrl + 'users/entities/' + entityKarate2.id +'/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method put
    Then status 200


  Scenario: Delete user from an entity (with tso1-operator authentication)
    #Given url opfabUrl + 'users/entities/' + entityDeletedFrom + '/users/' + userToDelete
    Given url opfabUrl + 'users/entities/' + entityKarate2.id  + '/users/' + userKarate2.login
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: No authentication, expected response 401
    Given url opfabUrl + 'users/entities/' + entityKarate2.id  + '/users/' + userKarate2.login
    When method delete
    Then status 401


  Scenario: Delete user from a non-existent entity
  #  non-existent entity, expected response 404
    Given def userToDelete = 'rte-operator'
    Given url opfabUrl + 'users/entities/' + 'entityNonExistent'  + '/users/' + userKarate2.login
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  #delete /entities/{id}/users/{login}
  Scenario: Delete user from an entity (with admin authentication)
    Given url opfabUrl + 'users/entities/' + entityKarate2.id  + '/users/' + userKarate2.login
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200