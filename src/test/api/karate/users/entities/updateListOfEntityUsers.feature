Feature: Update list of entity users

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining entities
    * def entity = 'entityKarate1'


    # defining users to create
    # defining users to create
    * def userKarate3 =
"""
{
   "login" : "loginKarate3",
   "firstName" : "name3",
   "lastName" : "familyName3"
}
"""

    * def userKarate4 =
"""
{
   "login" : "loginKarate4",
   "firstName" : "name4",
   "lastName" : "familyName4"
}
"""

    * def userKarate6 =
"""
{
   "login" : "loginKarate6",
   "firstName" : "name6",
   "lastName" : "familyName6"
}
"""

    * def userKarate6List =
"""
[
"loginkarate6"
]
"""

    * def userList =
"""
[
"loginkarate3", "loginkarate4"
]
"""

  Scenario: Create userKarate3 (if everything is ok, the user already exists)
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate3
    When method post
    Then status 200
    And match response.login == karate.lowerCase(userKarate3.login)
    And match response.firstName == userKarate3.firstName
    And match response.lastName == userKarate3.lastName


  Scenario: Create userKarate4 (if everything is ok, the user already exists)
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate4
    When method post
    Then status 200
    And match response.login == karate.lowerCase(userKarate4.login)
    And match response.firstName == userKarate4.firstName
    And match response.lastName == userKarate4.lastName


  Scenario: Create userKarate6 (if everything is ok, the user already exists)
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate6
    When method post
    Then status 200
    And match response.login == karate.lowerCase(userKarate6.login)
    And match response.firstName == userKarate6.firstName
    And match response.lastName == userKarate6.lastName


  Scenario: Add userKarate6 to the entity
    Given url opfabUrl + 'users/entities/' + entity + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate6List
    When method patch
    And status 200


  Scenario: Check that userKarate6 belongs to the entity
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userKarate6.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.entities[0] == entity


  Scenario: Update list of entity users without authentication
    Given url opfabUrl + 'users/entities/'+ entity + '/users'
    And request userList
    When method put
    Then status 401


  Scenario: Update list of entity users with user other than admin
    Given url opfabUrl + 'users/entities/'+ entity + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userList
    When method put
    Then status 403


  Scenario: Update list of and nonexistent entity
    Given url opfabUrl + 'users/entities/fake/users'
    And header Authorization = 'Bearer ' + authToken
    And request userList
    When method put
    Then status 404


  #Endpoints tested put /entities/{id}/users
  Scenario: Update list of entity users
    Given url opfabUrl + 'users/entities/'+ entity + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request userList
    When method put
    Then status 200


  Scenario: Check that userKarate3 belongs to the entity
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userKarate3.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.entities[0] == entity


  Scenario: Check that userKarate4 belongs to the entity
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userKarate4.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.entities[0] == entity


  Scenario: Check that userKarate6 no longer belongs to the entity
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userKarate6.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.entities.length == 0
